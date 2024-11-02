"use strict";

import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import Clutter from "gi://Clutter";
import St from "gi://St";
import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { TodoListManager } from "./manager.js";
import { isEmpty } from "./utils.js";

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init() {
      this._manager = new TodoListManager();

      super._init(0.0, _("Todo list"));

      // Add an icon to the panel
      // this.add_child(
      //   new St.Icon({
      //     icon_name: "object-select-symbolic",
      //     style_class: "system-status-icon",
      //   })
      // );

      this.mainBox = null;
      this.buttonText = new St.Label({
        text: _("(...)"),
        y_align: Clutter.ActorAlign.CENTER,
      });
      this.buttonText.set_style("text-align:center;");
      this.add_child(this.buttonText);
      this.actor.add_child(this.buttonText);

      this._buildUI();
      this._populate();
    }

    _buildUI() {
      // Destroy previous box
      if (this.mainBox != null) {
        this.mainBox.destroy();
      }

      // Create main box
      this.mainBox = new St.BoxLayout({ vertical: true });
      log(this.mainBox);

      // Create todos box
      this.todosBox = new St.BoxLayout({ vertical: true });
      // Create todos scrollview
      var scrollView = new St.ScrollView({
        style_class: "vfade",
        hscrollbar_policy: Gtk.PolicyType.NEVER,
        vscrollbar_policy: Gtk.PolicyType.AUTOMATIC,
      });
      scrollView.add_child(this.todosBox);
      this.mainBox.add_child(scrollView);

      // Separator
      var separator = new PopupMenu.PopupSeparatorMenuItem();
      this.mainBox.add_child(separator.actor);
      this.mainBox.set_style("width: 400px; max-height: 400px;");

      // Text entry
      this.newTask = new St.Entry({
        name: "newTaskEntry",
        hint_text: _("New task..."),
        track_hover: true,
        can_focus: true,
      });
      this.newTask.set_style("max-width: 300px;");

      let entryNewTask = this.newTask.clutter_text;
      entryNewTask.set_max_length(100);

      // Bottom section
      var bottomSection = new PopupMenu.PopupMenuSection();
      bottomSection.actor.add_child(this.newTask);
      bottomSection.actor.add_style_class_name("newTaskSection");
      this.mainBox.add_child(bottomSection.actor);
      this.menu.box.add_child(this.mainBox);
    }

    _populate() {
      const todos = this._manager.get();
      console.log("todos: ", todos)
      if (isEmpty(todos)) {
        let item = new St.Label({
          text: _("✅ Nothing to do for now"),
          y_align: Clutter.ActorAlign.CENTER,
          style: "text-align:center; font-size: 20px; padding: 15px 0;",
        });
        this.todosBox.add_child(item);
      } else {
        for (const task of todos) {
          let item = new PopupMenu.PopupMenuItem(task);
          this.todosBox.add_child(item);
        }
      }
    }

    _addTask(task) {}

    // // Method to add a new task with a remove button
    // _addTask(taskText) {
    //   let taskContainer = new St.BoxLayout({ style_class: "todo-task-item" });

    //   // Task label
    //   let taskLabel = new St.Label({ text: taskText, x_expand: true });

    //   // Remove button
    //   let removeButton = new St.Button({
    //     child: new St.Icon({
    //       icon_name: "edit-delete-symbolic",
    //       style_class: "remove-icon",
    //     }),
    //     style_class: "remove-button",
    //   });
    //   removeButton.connect("clicked", () => {
    //     this.todoListContainer.remove_child(taskContainer);
    //   });

    //   // Add label and remove button to task container
    //   taskContainer.add_child(taskLabel);
    //   taskContainer.add_child(removeButton);

    //   // Add task container to the todo list
    //   this.todoListContainer.add_child(taskContainer);
    // }
  }
);

export default class TodoListExtension extends Extension {
  enable() {
    this._indicator = new Indicator();
    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable() {
    this._indicator.destroy();
    this._indicator = null;
  }
}
