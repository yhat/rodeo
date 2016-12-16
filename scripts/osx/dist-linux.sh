#!/bin/bash
STARTING_DIR=$(pwd)
TARGET_DIR=~/Projects/yhat/rodeo

cd $TARGET_DIR

rm -rf dist

#dependencies
./scripts/osx/install-deps.sh
./scripts/osx/install-dist-linux-deps.sh

#remember nvm
echo '#guarantee nvm'
source $(brew --prefix nvm)/nvm.sh
nvm use

#build distributable
node_modules/.bin/build --linux --x64

#list created files
echo '#list created files'
git ls-files dist -o -x node_modules --directory

cd $STARTING_DIR
