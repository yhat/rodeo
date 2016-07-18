#!/bin/bash
# see https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build

STARTING_DIR=$(pwd)
TARGET_DIR=~/Projects/yhat/rodeo
NODE_VERSION=6

#guarantee nvm
echo '#guarantee nvm'
brew install nvm
source $(brew --prefix nvm)/nvm.sh

#install script dependencies
echo '#install script dependencies'
nvm install $NODE_VERSION
npm install -g gulp-cli electron-prebuilt

#build application (production and dev dependnencies)
cd $TARGET_DIR
echo '#build application (production and dev dependnencies)'
rm -rf app dist
npm install
gulp build
cd $STARTING_DIR

#install application including production dependencies only (no dev)
echo '#install application including production dependencies only (no dev)'
cd "$TARGET_DIR/app"
npm install --production
cd $STARTING_DIR

#check brew
echo '#check brew'
brew doctor
brew update
brew --version

echo '#check pip'
pip --version

# install testing dependencies (osx specific)
echo '#install testing dependencies (osx specific)'
brew tap homebrew/dupes
brew install libjpeg zlib
brew link zlib --force
pip install -q --upgrade setuptools pip
pip install -q jupyter
pip install -q numpy matplotlib plotly toyplot ipywidgets==4.1.1 pandas
