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

const MAX_WINDOW_WIDTH = 500;

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _manager!: TodoListManager;
    _isTodosEmpty: boolean = false;
    mainBox?: St.BoxLayout;
    todosBox!: St.BoxLayout;
    buttonText!: St.Label;
    input?: St.Entry;

    _init() {
      super._init(0.0, _("Todo list"));
      this._manager = new TodoListManager();
      console.log("###############################################");
      console.log(
        "IS UNDEFINED [this._manager]: ",
        this._manager === undefined
      );
      console.log("###############################################");
      // we use this state var, to destroy the current todos box children and not append to it, because if it's empty a message will be displayed
      this._isTodosEmpty = true;

      // Add an icon to the panel
      // this.add_child(
      //   new St.Icon({
      //     icon_name: "object-select-symbolic",
      //     style_class: "system-status-icon",
      //   })
      // );

      this.mainBox = undefined;
      this.buttonText = new St.Label({
        text: _("(...)"),
        y_align: Clutter.ActorAlign.CENTER,
      });
      this.buttonText.set_style("text-align:center;");
      this.add_child(this.buttonText);
      // this.actor.add_child(this.buttonText);

      this._buildUI();
      this._populate(); // initi
    }

    _buildUI() {
      // Destroy previous box
      if (this.mainBox != undefined) {
        this.mainBox.destroy();
      }

      // Create main box
      this.mainBox = new St.BoxLayout({ vertical: true });

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
      this.mainBox.set_style(
        `width: ${MAX_WINDOW_WIDTH}px; max-height: 500px;`
      );

      // Text entry
      this.input = new St.Entry({
        name: "newTaskEntry",
        hint_text: _("New task..."),
        track_hover: true,
        can_focus: true,
      });
      // this.input.clutterText.connect("activate", (s) => {
      //   console.log(s.get_text());
      // });
      // this.input.set_style("max-width: ${MAX_WINDOW_WIDTH};");
      console.log("UNDEFINED ?", this._manager === undefined);
      let todosLength = this._manager.get().length;
      console.log("UNDEFINED ?", this._manager === undefined);
      var _manager = this._manager
      this.input.clutterText.connect("activate", (source) => {
        console.log("...UNDEFINED ?", _manager === undefined);
        let taskText = source.get_text().trim();
        console.log(taskText);
        if (taskText) {
          this._addTask(taskText, todosLength);
          source.set_text("");
        }
      });
      this.input.clutter_text.set_max_length(200);

      // Bottom section
      var bottomSection = new PopupMenu.PopupMenuSection();
      bottomSection.actor.add_child(this.input);
      bottomSection.actor.add_style_class_name("newTaskSection");
      this.mainBox.add_child(bottomSection.actor);
      (this.menu as any).box.add_child(this.mainBox);
      console.log("UNDEFINED ?", this._manager === undefined);

    }

    _populate() {
      // clear the todos box before populating it
      this.todosBox.destroy_all_children();

      const todos = this._manager.get();
      if (isEmpty(todos)) {
        this._isTodosEmpty = true;
        let item = new St.Label({
          text: _("✅ Nothing to do for now"),
          y_align: Clutter.ActorAlign.CENTER,
          style: "text-align:center; font-size: 20px; padding: 15px 0;",
        });
        this.todosBox.add_child(item);
      } else {
        this._isTodosEmpty = false;
        let i = 0;
        for (const task of todos) {
          const parsedTask = JSON.parse(task);
          this._addTodoItem(parsedTask, i);
          i = i + 1;
        }
      }
    }

    _addTask(task: string, index: number) {
      console.log("UNDEFINED ?", this._manager === undefined);
      this._manager.add(task);
      if (this._isTodosEmpty) {
        this.todosBox.destroy_all_children();
        this._isTodosEmpty = false;
      }
      const newTask = { name: task, isDone: false };
      this._addTodoItem(newTask, index);
    }

    _addTodoItem(task: any, index: number) {
      // Create a new PopupMenuItem for the task
      let item = new PopupMenu.PopupMenuItem("");
      item.style_class = "item";
      // Create a horizontal box layout for custom alignment
      let box = new St.BoxLayout({
        style_class: "todo-item-layout", // You can add a custom class here
        vertical: false,
      });

      let toggleCompletionBtn = new St.Button({
        style_class: "toggle-completion-btn",
        y_align: Clutter.ActorAlign.CENTER,
      });

      toggleCompletionBtn.connect("clicked", () => {
        this._manager.update(index, { ...task, isDone: !task.isDone });
        this._populate();
      });

      box.add_child(toggleCompletionBtn);

      // Task label
      let label = new St.Label({
        text: task.name,
        y_align: Clutter.ActorAlign.CENTER,
        style_class: "task-label",
      });
      label.clutter_text.line_wrap = true;
      label.clutter_text.set_ellipsize(0);

      console.log(JSON.stringify(task, null, 2));

      if (task.isDone) {
        // label.set_style("text-decoration: overline;")
        label.clutter_text.set_markup(`<s>${task.name}</s>`);
        label.set_style("color: #999");
      }

      box.add_child(label);

      // Copty button
      const copyButton = new St.Button({
        child: new St.Icon({
          icon_name: "edit-copy-symbolic",
          style_class: "copy-icon",
        }),
        style_class: "copy-btn",
        y_align: Clutter.ActorAlign.CENTER,
        x_align: Clutter.ActorAlign.END,
      });
      copyButton.connect("clicked", () => {
        // Access the clipboard
        let clipboard = St.Clipboard.get_default();
        clipboard.set_text(St.ClipboardType.CLIPBOARD, task.name); // Copy to clipboard
        // Optionally show a notification
        Main.notify("Copied to clipboard", task.name);
        return Clutter.EVENT_STOP; // Stop propagation of the event
      });

      // Create the remove button
      const removeButton = new St.Button({
        child: new St.Icon({
          icon_name: "edit-delete-symbolic",
          style_class: "remove-icon",
        }),
        style_class: "remove-btn",
        y_align: Clutter.ActorAlign.CENTER,
        x_align: Clutter.ActorAlign.END,
      });

      // Connect the button click event
      removeButton.connect("clicked", () => {
        this._manager.remove(index);
        this._populate();
      });

      box.add_child(removeButton);
      box.add_child(copyButton);

      // Add the box to the item
      item.add_child(box);

      // Finally, add the item to the todosBox
      this.todosBox.add_child(item);
    }
  }
);

export default class TodoListExtension extends Extension {
  _indicator?: PanelMenu.Button | null;

  enable() {
    this._indicator = new Indicator(0.0, _("Todo list"));
    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable() {
    this._indicator?.destroy();
    this._indicator = null;
  }
}
