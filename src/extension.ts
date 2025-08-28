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
import GLib from "gi://GLib";

const MAX_WINDOW_WIDTH = 500;
const MAX_INPUT_CHARS = 200;
const buttonIcon = (total: number) => _(`(✔${total})`);

export default class TodoListExtension extends Extension {
    _indicator?: PanelMenu.Button | null;
    _manager!: TodoListManager | null;
    mainBox?: St.BoxLayout | null;
    todosBox!: St.BoxLayout | null;
    scrollView?: St.ScrollView | null;
    buttonText!: St.Label | null;
    input?: St.Entry | null;
    button!: PanelMenu.Button | null;
    clearAllBtn?: St.Button | null;
    _activeConfirmation?: PopupMenu.PopupMenuItem | null;
    _activeConfirmationTimeoutId?: number | null;
    _confirmationTimeoutId: number | null = null;

    enable() {
        this.button = new PanelMenu.Button(0.0, this.metadata.name, false);
        this._manager = new TodoListManager(this);
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
        this.scrollView = new St.ScrollView({
            style_class: "vfade",
        });
        this.scrollView.add_child(this.todosBox);
        // Separator
        var separator = new PopupMenu.PopupSeparatorMenuItem();

        // Text entry
        this.input = new St.Entry({
            name: "newTaskEntry",
            hint_text: _("Add new task..."),
            track_hover: true,
            can_focus: true,
            styleClass: "input",
            style: "width: 420px; height: 35px;",
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

        // Clear all button
        this.clearAllBtn = new St.Button({
            child: new St.Icon({
                icon_name: "edit-delete-symbolic",
                style_class: "btn-icon",
            }),
            style_class: "input-area-btn remove-btn",
            y_align: Clutter.ActorAlign.CENTER,
            x_align: Clutter.ActorAlign.END,
        });

        this.clearAllBtn.connect("clicked", () => {
            this._showClearAllConfirmation();
        });

        // Bottom section with input and buttons
        var bottomSection = new PopupMenu.PopupMenuSection();
        var inputContainer = new St.BoxLayout({
            vertical: false,
            style: "spacing: 10px;",
        });

        inputContainer.add_child(this.input);
        inputContainer.add_child(this.clearAllBtn);
        bottomSection.actor.add_child(inputContainer); this.mainBox.add_child(this.scrollView);
        this.mainBox.add_child(separator);
        this.mainBox.set_style(`width: ${MAX_WINDOW_WIDTH}px; max-height: 500px;`);
        this.mainBox.add_child(bottomSection.actor);

        (this.button?.menu as PopupMenu.PopupMenu).box.add_child(this.mainBox);
    }

    _populate() {
        // clear the todos box before populating it
        this.todosBox?.destroy_all_children();
        const allTodos = this._manager?.get();
        // Show all tasks (both done and undone)
        const todos = allTodos || [];

        if (isEmpty(todos)) {
            let item = new St.Label({
                text: _("✅ Nothing to do for now"),
                y_align: Clutter.ActorAlign.CENTER,
                style: "text-align:center; font-size: 20px; padding: 20px 0;",
            });
            this.todosBox?.add_child(item);
        } else {
            todos.forEach((task, index) => {
                const parsedTask = JSON.parse(task) as Task;
                this._addTodoItem(parsedTask, index);
            });
        }
    }

    _addTask(task: string) {
        this._manager?.add(task);
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

        // Selection checkbox (visible only in select mode)
        const selectionCheckbox = new St.Button({
            child: new St.Icon({
                icon_name: "",
                style_class: "btn-icon",
            }),
            style_class: "selection-checkbox",
            y_align: Clutter.ActorAlign.CENTER,
            visible: false,
        });

        // Remove the selection checkbox functionality completely
        // box.add_child(selectionCheckbox);

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
            this._manager?.update(index, { ...task, isDone: !task.isDone });
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

        // Task label/entry container
        const labelContainer = new St.BoxLayout({
            vertical: false,
            style_class: "task-label-container",
        });

        // Task label (default view)
        const label = new St.Label({
            text: task.name,
            y_align: Clutter.ActorAlign.CENTER,
            style_class: "task-label",
            reactive: true,
        });
        label.clutterText.line_wrap = true;
        label.clutterText.set_ellipsize(0);

        // Task entry (edit mode)
        const taskEntry = new St.Entry({
            text: task.name,
            style_class: "task-entry",
            y_align: Clutter.ActorAlign.CENTER,
            visible: false,
        });
        taskEntry.clutterText.set_max_length(MAX_INPUT_CHARS);

        if (task.isDone) {
            // cross line
            label.clutterText.set_markup(`<s>${task.name}</s>`);
            label.set_style("color: #999");
        }

        // Make label clickable to enter edit mode
        label.connect('button-press-event', () => {
            if (!task.isDone) { // Only allow editing if task is not done
                this._enterEditMode(label, taskEntry, task, index);
            }
            return Clutter.EVENT_STOP;
        });

        // Handle entry submission
        taskEntry.clutterText.connect('activate', () => {
            this._exitEditMode(label, taskEntry, task, index);
        });

        // Handle entry focus loss
        taskEntry.connect('key-focus-out', () => {
            this._exitEditMode(label, taskEntry, task, index);
        });

        // Handle escape key
        taskEntry.connect('key-press-event', (actor: any, event: any) => {
            if (event.get_key_symbol() === Clutter.KEY_Escape) {
                taskEntry.set_text(task.name); // Restore original text
                this._exitEditMode(label, taskEntry, task, index, false); // Don't save
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });

        labelContainer.add_child(label);
        labelContainer.add_child(taskEntry);

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

        // Rename button
        const renameButton = new St.Button({
            child: new St.Icon({
                icon_name: "document-edit-symbolic",
                style_class: "btn-icon",
            }),
            style_class: "rename-btn", // Use specific class for rename button
            y_align: Clutter.ActorAlign.CENTER,
            x_align: Clutter.ActorAlign.END,
        });
        renameButton.connect("clicked", () => {
            this._renameTask(task, index);
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
            if (task.isDone) {
                // No confirmation for completed tasks
                this._manager?.remove(index);
                this._populate();
                this._refreshTodosButtonText();
            } else {
                // Show confirmation for uncompleted tasks
                this._showDeleteConfirmation(task.name, index, () => {
                    this._manager?.remove(index);
                    this._populate();
                    this._refreshTodosButtonText();
                });
            }
        });    // Focus button
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
            this._manager?.update(index, {
                ...task,
                isFocused: !isFocused,
            });
            this._populate();
        });

        // Create action buttons container for right alignment
        const actionButtonsContainer = new St.BoxLayout({
            vertical: false,
            style_class: "action-buttons-container",
            style: "spacing: 5px;",
        });

        actionButtonsContainer.add_child(copyButton);
        actionButtonsContainer.add_child(renameButton);
        actionButtonsContainer.add_child(focusButton);
        actionButtonsContainer.add_child(removeButton);

        box.add_child(labelContainer);
        box.add_child(actionButtonsContainer);

        // Add the box to the item
        item.add_child(box);

        // Finally, add the item to the todosBox
        this.todosBox?.add_child(item);
    }

    _refreshTodosButtonText() {
        const total = this._manager?.getTotalUndone();
        this.buttonText?.clutterText.set_text(buttonIcon(total ?? 0));
    }

    _renameTask(task: Task, index: number) {
        // Don't allow renaming completed tasks
        if (task.isDone) {
            return;
        }

        // Put the task text in the input field
        this.input?.set_text(task.name);

        // Remove the task from the list
        this._manager?.remove(index);

        // Refresh the view to remove the task from display
        this._populate();
        this._refreshTodosButtonText();

        // Focus the input field for editing
        this.input?.clutterText.grab_key_focus();

        // Select all text for easy editing
        this.input?.clutterText.set_selection(0, -1);
    }

    _toggleShortcut() {
        Main.wm.addKeybinding(
            "open-todozen",
            this.getSettings(),
            Meta.KeyBindingFlags.NONE,
            Shell.ActionMode.ALL,
            () => {
                this.button?.menu.toggle();
                this.input?.clutterText.grab_key_focus();
            }
        );
    }

    _enterEditMode(label: St.Label, taskEntry: St.Entry, task: Task, index: number) {
        label.visible = false;
        taskEntry.visible = true;
        taskEntry.grab_key_focus();
        // Select all text
        taskEntry.clutterText.set_selection(0, -1);
    }

    _exitEditMode(label: St.Label, taskEntry: St.Entry, task: Task, index: number, shouldSave = true) {
        if (shouldSave) {
            const newText = taskEntry.get_text().trim();
            if (newText && newText !== task.name) {
                // Update the task
                this._manager?.update(index, { ...task, name: newText });
                this._populate(); // Refresh the view
                return;
            }
        }

        // Just switch back to label view
        taskEntry.visible = false;
        label.visible = true;
    }

    _createConfirmationDialog(
        message: string,
        onConfirm: () => void,
        insertIndex: number = 0,
        scrollToTop: boolean = false
    ) {
        // Remove any existing confirmation first
        if (this._activeConfirmation) {
            this.todosBox!.remove_child(this._activeConfirmation);
            this._activeConfirmation = null;
        }

        // Create main confirmation item
        const confirmItem = new PopupMenu.PopupMenuItem("");
        confirmItem.style_class = "item confirmation-item";
        this._activeConfirmation = confirmItem;

        // Create confirmation container - single horizontal line
        const confirmBox = new St.BoxLayout({
            vertical: false,
            style_class: "confirmation-container",
            style: "padding: 8px 12px; spacing: 8px; align-items: center;",
        });

        const warningIcon = new St.Icon({
            icon_name: "dialog-warning-symbolic",
            style_class: "btn-icon",
            style: "color: #e53e3e; margin-right: 8px;",
        });

        const confirmLabel = new St.Label({
            text: message,
            style: "font-weight: bold;",
            y_align: Clutter.ActorAlign.CENTER,
        });

        const cancelBtn = new St.Button({
            child: new St.Icon({
                icon_name: "window-close-symbolic",
                style_class: "btn-icon",
            }),
            style_class: "focus-btn",
            y_align: Clutter.ActorAlign.CENTER,
        });

        const confirmBtn = new St.Button({
            child: new St.Icon({
                icon_name: "edit-delete-symbolic",
                style_class: "btn-icon",
            }),
            style_class: "remove-btn",
            y_align: Clutter.ActorAlign.CENTER,
        });

        // Spacer to push buttons to the right
        const spacer = new St.Widget({
            style: "min-width: 0px;",
            x_expand: true,
        });

        // Button container
        const buttonContainer = new St.BoxLayout({
            vertical: false,
            style: "spacing: 4px;",
        });
        buttonContainer.add_child(cancelBtn);
        buttonContainer.add_child(confirmBtn);

        const removeConfirmation = () => {
            if (this._activeConfirmation) {
                this.todosBox!.remove_child(this._activeConfirmation);
                this._activeConfirmation = null;
            }
        };

        cancelBtn.connect("clicked", removeConfirmation);

        confirmBtn.connect("clicked", () => {
            removeConfirmation();
            onConfirm();
        });

        confirmBox.add_child(warningIcon);
        confirmBox.add_child(confirmLabel);
        confirmBox.add_child(spacer);
        confirmBox.add_child(buttonContainer);
        confirmItem.add_child(confirmBox);

        this.todosBox!.insert_child_at_index(confirmItem, insertIndex);

        if (scrollToTop) {
            // Scroll to top to make the confirmation visible
            this.scrollView?.get_vscroll_bar()?.get_adjustment()?.set_value(0);
        }

        // Clear previous timeout if any
        if (this._confirmationTimeoutId) {
            GLib.source_remove(this._confirmationTimeoutId);
            this._confirmationTimeoutId = null;
        }

        // Set new timeout
        this._confirmationTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 8000, () => {
            if (this._activeConfirmation === confirmItem) {
                removeConfirmation();
            }
            this._confirmationTimeoutId = null;
            return GLib.SOURCE_REMOVE;
        });
    }

    _showClearAllConfirmation() {
        const allTodos = this._manager?.get() || [];
        if (allTodos.length === 0) {
            return; // Nothing to clear
        }

        this._createConfirmationDialog(
            "Clear all tasks?",
            () => this._clearAllTasks(),
            0,
            true
        );
    }

    _clearAllTasks() {
        const allTodos = this._manager?.get() || [];
        // Remove all tasks in reverse order to maintain indices
        for (let i = allTodos.length - 1; i >= 0; i--) {
            this._manager?.remove(i);
        }
        this._populate();
        this._refreshTodosButtonText();
    }

    _showDeleteConfirmation(taskName: string, itemIndex: number, onConfirm: () => void) {
        // Create a beautiful modal-like confirmation
        const truncatedName = taskName.length > 40 ? taskName.substring(0, 40) + "..." : taskName;

        this._createConfirmationDialog(
            `Delete "${truncatedName}"?`,
            onConfirm,
            itemIndex + 1,
            false
        );
    }

    disable() {
        // Remove keybinding
        Main.wm.removeKeybinding("open-todozen");

        // Remove all timeouts safely
        if (this._activeConfirmationTimeoutId) {
            GLib.source_remove(this._activeConfirmationTimeoutId);
            this._activeConfirmationTimeoutId = null;
        }

        if (this._confirmationTimeoutId) {
            GLib.source_remove(this._confirmationTimeoutId);
            this._confirmationTimeoutId = null;
        }

        if (this._activeConfirmation) {
            try {
                this.todosBox?.remove_child(this._activeConfirmation);
            } catch {
            }
            this._activeConfirmation = null;
        }

        // Destroy UI objects safely
        const widgets = [
            this.mainBox,
            this.todosBox,
            this.scrollView,
            this.buttonText,
            this.input,
            this.button,
            this.clearAllBtn,
            this._indicator
        ];

        let failedDestroy = false;

        for (const widget of widgets) {
            if (widget) {
                try {
                    widget.destroy();
                } catch {
                    failedDestroy = true;
                }
            }
        }

        if (failedDestroy) {
            console.warn('Warning: some widgets failed to destroy in disable()');
        }

        // Clear references
        this.mainBox = null;
        this.todosBox = null;
        this.scrollView = null;
        this.buttonText = null;
        this.input = null;
        this.button = null;
        this.clearAllBtn = null;
        this._indicator = null;
        this._activeConfirmation = null;
    }

}
