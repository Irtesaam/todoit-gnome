import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import { isEmpty } from "./utils.js";

const TODOS = "todos";

export class TodoListManager {
  constructor() {
    const extensionObject = Extension.lookupByUUID('todoit@wassimbj.github.io');
    this.GSettings = extensionObject.getSettings()
  }

  get() {
    // retrieves todos as an array of strings
    return this.GSettings.get_strv(TODOS);
  }

  add(todo) {
    let todos = this.get();
    todos.push(todo);
    this.GSettings.set_strv(TODOS, todos);
  }

  remove(index) {
    let todos = this.get();
    if (isEmpty(todos)) {
      return;
    }
    todos.splice(index, 1);
    this.GSettings.set_strv(TODOS, todos);
  }
}
