#!/bin/bash
# see https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build

STARTING_DIR=$(pwd)
TARGET_DIR=~/Projects/yhat/rodeo
CACHE_MIN=999999999

#check brew
echo '#check brew'
brew doctor
brew update
brew --version

# install testing dependencies (osx specific)
echo '#install testing dependencies (osx specific)'
brew tap homebrew/dupes

if ! brew list --versions | grep -q libjpeg; then
    brew install libjpeg
fi

if ! brew list --versions | grep -q zlib; then
    brew install zlib
    brew link zlib --force
fi
