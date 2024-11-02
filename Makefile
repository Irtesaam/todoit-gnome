.PHONY: start
start:
	dbus-run-session -- gnome-shell --nested --wayland

.PHONY: schemas
schemas:
	rm ./schemas/gschemas.compiled
	glib-compile-schemas ./schemas


.PHONY: build
build:
	yarn build

clean_build:
	rm *.js

build_run: clean_build build start