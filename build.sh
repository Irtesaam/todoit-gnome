#!/bin/bash

zip_name="todoit-fork@irtesaam.github.io"

# the container of the final running build
echo "######## Create build dir ########"
mkdir build

# to generate the *.js files required to run the extension
echo "######## Build ts ########"
yarn build

# build the schema
echo "######## Build schema ########"
make schemas

# copy the required files
echo "######## Copy required files ########"
cp -r schemas build
cp *.js build
cp stylesheet.css build
cp metadata.json build
cp LICENCE build

echo "######## Zip ########"
cd build
zip ../$zip_name.zip  -x *.git -r .


echo "######## Final result ########"
tree .
