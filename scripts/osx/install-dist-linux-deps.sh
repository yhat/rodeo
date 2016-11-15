#!/bin/bash
#see https://github.com/electron-userland/electron-builder/wiki/Multi-Platform-Build

#so we can build linux on mac
echo '#so we can build linux on mac'

if ! brew list --versions | grep -q gnu-tar; then
    brew install gnu-tar
fi

if ! brew list --versions | grep -q libicns; then
    brew install libicns
fi

if ! brew list --versions | grep -q graphicsmagick; then
    brew install graphicsmagick
fi

if ! brew list --versions | grep -q rpm; then
    brew install rpm
fi
