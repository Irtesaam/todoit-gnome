#!/bin/bash

zip_name="todoit@wassimbj.github.io"

# the container of the final running build
echo "Create build dir"
mkdir build

# to generate the *.js files required to run the extension
echo "Build ts"
yarn build

# build the schema
echo "Build schema"
make schemas

# copy the required files
echo "Copy required files"
cp -r schemas build
cp *.js build
cp stylesheet.css build
cp metadata.json build

echo "Zip"
zip $zip_name.zip -x *.git -r build

tree build

