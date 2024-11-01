import Gio from "gi://Gio";
import GLib from "gi://GLib";

export function isEmpty(data) {
  if (Array.isArray(data)) {
    return data.length === 0;
  }

  return !data;
}

export function getGSettings() {
  // const Extension = extensionUtils.getCurrentExtension();
  // Get the directory where the extension's schemas are located
  const dir = `${GLib.get_home_dir()}/.local/share/gnome-shell/extensions/todoit@wassimbj.github.io`
  const schemaDir = GLib.build_filenamev([dir, "schemas"]);

  // Create a schema source from the directory
  let source = Gio.SettingsSchemaSource.new_from_directory(
    schemaDir,
    Gio.SettingsSchemaSource.get_default(),
    false
  );

  if (!source) {
    throw new Error("Error initializing the schema source.");
  }

  // Lookup the schema using the correct schema ID
  let schema = source.lookup("org.gnome.shell.extensions.todoit", false);

  if (!schema) {
    throw new Error("Schema missing.");
  }

  // Return the settings object using the schema
  console.log(schema)
  return new Gio.Settings({ settings_schema: schema });
}
