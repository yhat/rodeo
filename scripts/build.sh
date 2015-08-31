#!/bin/bash


TMP_DIR=$(mktemp -d /tmp/rodeo.XXXXX)

cp -R src/ $TMP_DIR
cp -R static/ $TMP_DIR
cp -R node_modules/ $TMP_DIR
cp -R resources/ $TMP_DIR
cp package.json "${TMP_DIR}/"

ELECTRON_VERSION=$(electron --version | tr -d 'v')
electron-packager ${TMP_DIR} Rodeo --platform=darwin --arch=x64 --version=${ELECTRON_VERSION}
test ! -d build && mkdir build
mv Rodeo-darwin-x64 ./build/
