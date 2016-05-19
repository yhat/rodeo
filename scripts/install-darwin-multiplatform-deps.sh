#!/bin/bash
# see https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build

# so we can build windows on mac
brew install Caskroom/cask/xquartz wine mono

# so we can build linux on mac
brew install gnu-tar libicns graphicsmagick
