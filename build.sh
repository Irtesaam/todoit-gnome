#!/bin/bash

extension_name="todoit"

# the container of the final running build
mkdir build

# to generate the *.js files required to run the extension
yarn build

# build the schema
make schemas

# copy the required files
cp -r schemas build
cp *.js build
cp stylesheet.css build
cp metadata.json build

tree build

