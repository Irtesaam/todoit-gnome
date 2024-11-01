.PHONY: start
start:
	dbus-run-session -- gnome-shell --nested --wayland

.PHONY: schemas
schemas:
	rm ./schemas/gschemas.compiled
	glib-compile-schemas ./schemas