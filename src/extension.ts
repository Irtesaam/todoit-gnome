"use strict";
import Clutter from "gi://Clutter";
import St from "gi://St";
import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import { Task, TodoListManager } from "./manager.js";
import { isEmpty } from "./utils.js";
import Meta from "gi://Meta";
import Shell from "gi://Shell";

const MAX_WINDOW_WIDTH = 500;
const MAX_INPUT_CHARS = 200;
const buttonIcon = (total: number) => _(`(✔${total})`);

export default class TodoListExtension extends Extension {
  _indicator?: PanelMenu.Button | null;
  _manager!: TodoListManager;
  mainBox?: St.BoxLayout;
  todosBox!: St.BoxLayout;
  buttonText!: St.Label;
  input?: St.Entry;
  button!: PanelMenu.Button;

  enable() {
    this.button = new PanelMenu.Button(0.0, this.metadata.name, false);
    this._manager = new TodoListManager();
    const totalTodos = this._manager.getTotalUndone();

    this.buttonText = new St.Label({
      text: buttonIcon(totalTodos),
      y_align: Clutter.ActorAlign.CENTER,
    });
    this.buttonText.set_style("text-align:center;");
    this.button.add_child(this.buttonText);
    this._indicator = this.button;
    Main.panel.addToStatusArea(this.uuid, this._indicator);
    // Create a PopupMenu for the button
    this._buildPopupMenu();
    this._populate();
    this._toggleShortcut();
  }

  _buildPopupMenu() {
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
    });
    scrollView.add_child(this.todosBox);
    // Separator
    var separator = new PopupMenu.PopupSeparatorMenuItem();

    // Text entry
    this.input = new St.Entry({
      name: "newTaskEntry",
      hint_text: _("New task..."),
      track_hover: true,
      can_focus: true,
      styleClass: "input",
    });

    // this.input.set_style("max-width: ${MAX_WINDOW_WIDTH};");
    this.input.clutterText.connect("activate", (source) => {
      let taskText = source.get_text().trim();
      if (taskText) {
        this._addTask(taskText);
        source.set_text("");
        source.grab_key_focus();
      }
    });
    this.input.clutterText.set_max_length(MAX_INPUT_CHARS);

    // Bottom section
    var bottomSection = new PopupMenu.PopupMenuSection();
    bottomSection.actor.add_child(this.input);

    this.mainBox.add_child(scrollView);
    this.mainBox.add_child(separator);
    this.mainBox.set_style(`width: ${MAX_WINDOW_WIDTH}px; max-height: 500px;`);
    this.mainBox.add_child(bottomSection.actor);

    (this.button.menu as PopupMenu.PopupMenu).box.add_child(this.mainBox);
  }

  _populate() {
    // clear the todos box before populating it
    this.todosBox.destroy_all_children();

    const todos = this._manager.get();
    if (isEmpty(todos)) {
      let item = new St.Label({
        text: _("✅ Nothing to do for now"),
        y_align: Clutter.ActorAlign.CENTER,
        style: "text-align:center; font-size: 20px; padding: 20px 0;",
      });
      this.todosBox.add_child(item);
    } else {
      let i = 0;
      for (const task of todos) {
        const parsedTask = JSON.parse(task);
        this._addTodoItem(parsedTask, i);
        i = i + 1;
      }
    }
  }

  _addTask(task: string) {
    this._manager.add(task);
    this._populate();
    this._refreshTodosButtonText();
  }

  _addTodoItem(task: Task, index: number) {
    const isFocused = index === 0 && task.isFocused;
    // Create a new PopupMenuItem for the task
    let item = new PopupMenu.PopupMenuItem("");
    item.style_class = `item ${isFocused ? "focused-task" : ""}`;
    // Create a horizontal box layout for custom alignment
    let box = new St.BoxLayout({
      style_class: "todo-item-layout", // You can add a custom class here
      vertical: false,
    });

    // Checkbox button
    const toggleBtnLabel = new St.Label({
      text: task.isDone ? "✔" : "",
    });
    const toggleCompletionBtn = new St.Button({
      style_class: "toggle-completion-btn",
      y_align: Clutter.ActorAlign.CENTER,
      child: toggleBtnLabel,
    });

    toggleCompletionBtn.connect("clicked", () => {
      this._manager.update(index, { ...task, isDone: !task.isDone });
      const willBeDone = !task.isDone;
      if (willBeDone) {
        // toggler, so we are going to add the done icon
        toggleBtnLabel.set_text("✔");
      } else {
        toggleBtnLabel.set_text("");
      }
      this._populate();
      this._refreshTodosButtonText();
    });

    box.add_child(toggleCompletionBtn);

    // Task label
    const label = new St.Label({
      text: task.name,
      y_align: Clutter.ActorAlign.CENTER,
      style_class: "task-label",
    });
    label.clutterText.line_wrap = true;
    label.clutterText.set_ellipsize(0);

    if (task.isDone) {
      // cross line
      label.clutterText.set_markup(`<s>${task.name}</s>`);
      label.set_style("color: #999");
    }

    // Copty button
    const copyButton = new St.Button({
      child: new St.Icon({
        icon_name: "edit-copy-symbolic",
        style_class: "btn-icon",
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

    // Remove button
    const removeButton = new St.Button({
      child: new St.Icon({
        icon_name: "edit-delete-symbolic",
        style_class: "remove-icon btn-icon",
      }),
      style_class: "remove-btn",
      y_align: Clutter.ActorAlign.CENTER,
      x_align: Clutter.ActorAlign.END,
    });

    // Connect the button click event
    removeButton.connect("clicked", () => {
      this._manager.remove(index);
      this._populate();
      this._refreshTodosButtonText();
    });

    // Focus button
    const focusButton = new St.Button({
      child: new St.Icon({
        icon_name: "find-location-symbolic",
        style_class: "focus-icon btn-icon",
      }),
      style_class: "focus-btn",
      y_align: Clutter.ActorAlign.CENTER,
      x_align: Clutter.ActorAlign.END,
    });

    focusButton.connect("clicked", () => {
      this._manager.update(index, {
        ...task,
        isFocused: !isFocused,
      });
      this._populate();
    });

    box.add_child(label);
    box.add_child(copyButton);
    box.add_child(focusButton);
    box.add_child(removeButton);

    // Add the box to the item
    item.add_child(box);

    // Finally, add the item to the todosBox
    this.todosBox.add_child(item);
  }

  _refreshTodosButtonText() {
    const total = this._manager.getTotalUndone();
    this.buttonText.clutterText.set_text(buttonIcon(total));
  }

  _toggleShortcut() {
    Main.wm.addKeybinding(
      "open-todoit",
      this.getSettings(),
      Meta.KeyBindingFlags.NONE,
      Shell.ActionMode.ALL,
      () => {
        this.button.menu.toggle();
        this.input?.clutterText.grab_key_focus();
      }
    );
  }

  disable() {
    this._indicator?.destroy();
    this.mainBox?.destroy();
    this.todosBox?.destroy();
    this.buttonText?.destroy();
    this.input?.destroy();
    this.button?.destroy();

    this._indicator = null;
  }
}
