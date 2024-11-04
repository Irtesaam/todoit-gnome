# build and pack

.PHONY: start
start:
	dbus-run-session -- gnome-shell --nested --wayland

.PHONY: schemas
schemas:
	rm ./schemas/gschemas.compiled -f
	glib-compile-schemas ./schemas


.PHONY: build
build:
	yarn build

clean_build:
	rm *.js -f

build_run: clean_build build start

clean_build:
	rm build -rf