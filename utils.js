
export function isEmpty(data) {
  if (Array.isArray(data)) {
    return data.length === 0;
  }

  return !data;
}

// export function getGSettings() {
//   // Getting the extension object by UUID
//   const extensionObject = Extension.lookupByUUID('todoit@wassimbj.github.io');
//   const extensionSettings = extensionObject.getSettings();
//   return extensionSettings

//   // // Get the directory where the extension's schemas are located
//   // const extensionDir = `${GLib.get_home_dir()}/.local/share/gnome-shell/extensions/todoit@wassimbj.github.io`;
//   // const schemaDir = GLib.build_filenamev([extensionDir, "schemas"]);

//   // // Create a schema source from the directory
//   // let source = Gio.SettingsSchemaSource.new_from_directory(
//   //   schemaDir,
//   //   Gio.SettingsSchemaSource.get_default(),
//   //   false
//   // );

//   // if (!source) {
//   //   throw new Error("Error initializing the schema source.");
//   // }

//   // // Lookup the schema using the correct schema ID
//   // let schema = source.lookup("org.gnome.shell.extensions.todoit", false);

//   // if (!schema) {
//   //   throw new Error("Schema missing.");
//   // }

//   // // Return the settings object using the schema
//   // return new Gio.Settings({ settings_schema: schema });
// }
