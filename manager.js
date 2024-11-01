import Gio from "gi://Gio";
import GLib from "gi://GLib";
import { getGSettings } from "./utils.js";

// /home/wassimbj/snap/code/173/.local/share/glib-2.0/schemas
const TODOS = "todos";

export class TodoListManager {
  constructor() {
    // this.settings = new Gio.Settings({ schema_id: TODO_SCHEMA,  });
    // if (!this.settings) {
    //   throw new Error("failed to init Gio.Settings");
    // }

    this.settings = getGSettings()
  }

  get() {
    return this.settings.get_strv(TODOS); // retrieves todos as an array of strings
  }

  add(todo) {
    let todos = this.getTodos();
    todos.push(todo);
    this.settings.set_strv(TODOS, todos); // saves updated list
  }

  remove(index) {
    let todos = this.getTodos();
    todos.splice(index, 1);
    this.settings.set_strv(TODOS, todos); // saves updated list
  }
}
