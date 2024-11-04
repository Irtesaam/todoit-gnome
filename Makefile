# to start developping
.PHONY: dev
dev: yarn run

.PHONY: start
start:
	dbus-run-session -- gnome-shell --nested --wayland

# build schema
.PHONY: schemas
schemas:
	rm ./schemas/gschemas.compiled -f
	glib-compile-schemas ./schemas

# build ts
.PHONY: build
build:
	yarn build

clean_build:
	rm build *.zip *.js -rf

# run build
.PHONY: run
run: clean_build build start

# pack for distribution
.PHONY: pack
pack:
	rm build -rf
	rm *.zip -rf
	sh build.sh