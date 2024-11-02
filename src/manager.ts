import { Extension } from "resource:///org/gnome/shell/extensions/extension.js";
import { isEmpty } from "./utils.js";
import Gio from "gi://Gio";

const TODOS = "todos";

export class TodoListManager {
  GSettings: Gio.Settings;

  constructor() {
    const extensionObject = Extension.lookupByUUID("todoit@wassimbj.github.io");
    this.GSettings = extensionObject!.getSettings();
  }

  get() {
    // retrieves todos as an array of strings
    return this.GSettings.get_strv(TODOS);
  }

  add(task: string) {
    let todos = this.get();
    todos.push(JSON.stringify({ name: task, isDone: false }));
    this.GSettings.set_strv(TODOS, todos);
  }

  remove(index: number) {
    let todos = this.get();
    if (isEmpty(todos)) {
      return;
    }
    todos.splice(index, 1);
    this.GSettings.set_strv(TODOS, todos);
  }

  update(index: number, todo: Task) {
    let todos = this.get();
    if (isEmpty(todos)) {
      return;
    }
    todos[index] = JSON.stringify(todo, null, 2);
    this.GSettings.set_strv(TODOS, todos);
  }
}

interface Task {
  name: string;
  isDone: boolean
}
