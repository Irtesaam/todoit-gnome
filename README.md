<h1 align="center"> 🚀 Todoit Gnome Extension - Enhanced Fork </h1>

## 🎯 About This Fork

This is an enhanced fork of the original [Todoit GNOME Extension](https://github.com/wassimbj/todoit-gnome) by wassimbj. While the original extension provided a solid foundation, this fork focuses on improving user experience, adding productivity features, and refining the interface.

## 🎬 Demo

![autocomplete](static/demo.gif)

## ✨ Features

### 🆕 **Enhanced Features (This Fork)**
- **🎯 Task Renaming**: Dedicated rename button that moves tasks to input field again.
- **🔄 Improved Task Ordering**: New tasks automatically appear at the top (except focused ones)
- **🗑️ Clear All**: Simple one-click clear all functionality with confirmation dialog box to avoid accidental cick.
- **🎪 Enhanced UI**: Improved button spacing, hover effects, and overall polish.
- **🎨 Polished Confirmation Dialogs**: Compact confirmation prompts that appear contextually.

### 🎖️ **Core Features (Original)**
- ➕ Add/remove/copy tasks
- ✅ Toggle task completion status
- ⌨️ Quick toggle with keyboard shortcut (Alt+Shift+Space)
- 🎯 Focus on specific tasks (moves to top with highlight)
- 📋 Copy tasks to clipboard
- 🎨 Clean, native GNOME integration

## 🗺️ Upcoming

### 🎯 **Coming Soon**
- **📅 Due Date Management**: deadline tracking
- **📁 Priority Filters**: Organize tasks by priority filters (maybe combine with deadline somehow)
- **🔔 Native GNOME Notifications**: Smart reminders integrated with the system
- **⚡ Performance Optimization**: Debloat and Optimise the extension for performance

## 🖥️ System Requirements

Todoit uses modern GNOME APIs with ESM module support.
**Compatible with GNOME Shell 45+** 🐧

## 📦 Installation

### 🏪 **Official Store (Recommended)**
Available on GNOME Extensions: Not yet !
<!--Available on GNOME Extensions: [Will publish soon](https://extensions.gnome.org/extension/7538)-->

### 🔧 **Manual Installation**

#### 1️⃣ Install GNOME Extensions Manager

Fedora/RHEL/CentOS
```bash
sudo dnf install gnome-extensions-app
```
Ubuntu/Debian
```bash
sudo apt install gnome-shell-extensions
```

#### 2️⃣ Download & Extract
```bash
# Download the latest version from this fork
wget https://github.com/Irtesaam/todoit-gnome/raw/master/todoit@wassimbj.github.io.zip

# Create extensions directory if needed
mkdir -p ~/.local/share/gnome-shell/extensions

# Extract to extensions folder
unzip todoit@wassimbj.github.io.zip -d ~/.local/share/gnome-shell/extensions/
```

#### 3️⃣ Enable Extension
Open Extensions manager and enable **Todoit**.

Expected file structure:
```
todoit@wassimbj.github.io/
├── extension.js
├── LICENCE
├── manager.js
├── metadata.json
├── schemas/
│   ├── gschemas.compiled
│   └── org.gnome.shell.extensions.todoit.gschema.xml
├── stylesheet.css
└── utils.js
```

## 🛠️ Development

### Building from Source
```bash
git clone https://github.com/Irtesaam/todoit-gnome.git
cd todoit-gnome
yarn install
./build.sh
```

### Contributing
Contributions are welcome! This fork aims to implement the roadmap features while maintaining code quality and GNOME design principles.

## 🙏 Credits & Acknowledgments

- **Original Extension**: [wassimbj/todoit-gnome](https://github.com/wassimbj/todoit-gnome)
- **Icons**: [Flaticon](https://www.flaticon.com)
- **Enhanced by**: [Irtesaam](https://github.com/Irtesaam)

## 📄 License

This project maintains the same license as the original work.

---

<p align="center">
  <em>Made with ❤️ for the GNOME community</em>
</p>
