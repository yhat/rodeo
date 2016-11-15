#!/bin/bash
#see https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build

#so we can build windows on mac
echo '#so we can build windows on mac'

if ! brew list --versions | grep -q xquartz; then
    brew install Caskroom/cask/xquartz
fi

if ! brew list --versions | grep -q wine; then
    brew install wine
fi

if ! brew list --versions | grep -q mono; then
    brew install mono
fi
