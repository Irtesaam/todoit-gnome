// /* ====================================================== */

// "use strict";

// import GObject from "gi://GObject";
// import St from "gi://St";
// import {
//   Extension,
//   gettext as _,
// } from "resource:///org/gnome/shell/extensions/extension.js";
// import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
// import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
// import * as Main from "resource:///org/gnome/shell/ui/main.js";

// const Indicator = GObject.registerClass(
//   class Indicator extends PanelMenu.Button {
//     _init() {
//       super._init(0.0, _("Todo list"));

//       // Add an icon to the panel
//       this.add_child(
//         new St.Icon({
//           icon_name: "task-list-symbolic",
//           style_class: "system-status-icon",
//         })
//       );

//       // Create a container for the to-do input and list
//       this.todoListContainer = new St.BoxLayout({ vertical: true });

//       // Add an input field for adding new tasks
//       let inputContainer = new St.BoxLayout();
//       let inputField = new St.Entry({
//         hint_text: _("Add a task..."),
//         can_focus: true,
//       });
//       let inputEntry = inputField.clutter_text;
//       inputContainer.add_child(inputField);

//       // Add task on Enter key press
//       inputEntry.connect("activate", () => {
//         let taskText = inputEntry.get_text().trim();
//         if (taskText) {
//           this._addTask(taskText);
//           inputEntry.set_text(""); // Clear the input
//         }
//       });

//       // Add input container to menu
//       let inputItem = new PopupMenu.PopupMenuItem("");
//       inputItem.add_child(inputContainer);
//       this.menu.addMenuItem(inputItem);

//       // Add the to-do list container to the menu
//       let todoListItem = new PopupMenu.PopupMenuItem("");
//       todoListItem.add_child(this.todoListContainer);
//       this.menu.addMenuItem(todoListItem);
//     }

//     // Method to add a new task
//     _addTask(taskText) {
//       let taskItem = new St.Label({
//         text: taskText,
//         style_class: "todo-task-item",
//       });

//       // Remove task on click
//       taskItem.connect("button-press-event", () => {
//         this.todoListContainer.remove_child(taskItem);
//       });

//       this.todoListContainer.add_child(taskItem);
//     }
//   }
// );

// export default class TodoListExtension extends Extension {
//   enable() {
//     this._indicator = new Indicator();
//     Main.panel.addToStatusArea(this.uuid, this._indicator);
//   }

//   disable() {
//     this._indicator.destroy();
//     this._indicator = null;
//   }
// }

// /* ====================================================== */


"use strict";

import GObject from "gi://GObject";
import Gtk from "gi://Gtk";
import Gtk from "gi://Clutter";
import St from "gi://St";
import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, _("Todo list"));

      // Add an icon to the panel
      this.add_child(
        new St.Icon({
          icon_name: "task-list-symbolic",
          style_class: "system-status-icon",
        })
      );

      // Create a container for the to-do input and list
      this.todoListContainer = new St.BoxLayout({ vertical: true });

      // Add an input field for adding new tasks
      let inputContainer = new St.BoxLayout();
      let inputField = new St.Entry({
        hint_text: _("Add a task..."),
        can_focus: true,
        x_expand: true,
      });
      let inputEntry = inputField.clutter_text;
      inputContainer.add_child(inputField);

      // Prevent the menu from closing when clicking the input field
      inputField.connect("button-press-event", (actor, event) => {
        return Clutter.EVENT_STOP;
      });

      // Add task on Enter key press
      inputEntry.connect("activate", () => {
        let taskText = inputEntry.get_text().trim();
        if (taskText) {
          this._addTask(taskText);
          inputEntry.set_text(""); // Clear the input
        }
      });

      // Add input container to menu
      let inputItem = new PopupMenu.PopupMenuItem("");
      inputItem.add_child(inputContainer);
      this.menu.addMenuItem(inputItem);

      // Add the to-do list container to the menu
      let todoListItem = new PopupMenu.PopupMenuItem("");
      todoListItem.add_child(this.todoListContainer);
      this.menu.addMenuItem(todoListItem);
    }

    // Method to add a new task with a remove button
    _addTask(taskText) {
      let taskContainer = new St.BoxLayout({ style_class: "todo-task-item" });

      // Task label
      let taskLabel = new St.Label({ text: taskText, x_expand: true });

      // Remove button
      let removeButton = new St.Button({
        child: new St.Icon({
          icon_name: "edit-delete-symbolic",
          style_class: "remove-icon",
        }),
        style_class: "remove-button",
      });
      removeButton.connect("clicked", () => {
        this.todoListContainer.remove_child(taskContainer);
      });

      // Add label and remove button to task container
      taskContainer.add_child(taskLabel);
      taskContainer.add_child(removeButton);

      // Add task container to the todo list
      this.todoListContainer.add_child(taskContainer);
    }
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
