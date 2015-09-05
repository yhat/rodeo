#!/bin/bash

# osx
electron-builder build/darwin/x64/Rodeo-darwin-x64/Rodeo.app --platform=osx \
        --out=./build/darwin/x64/Rodeo-darwin-x64/ --config=packager.json
# windows
#   32 bit
electron-builder build/win32/all/Rodeo-win32-ia32 --platform=win \
        --out=./build/win32/all//Rodeo-win32-ia32 --config=packager.json
#   64 bit
electron-builder build/win32/all/Rodeo-win32-x64 --platform=win \
        --out=./build/win32/all/Rodeo-win32-x64 --config=packager.json

# echo "UPLOADING TO GITHUB"
# 
# github-release upload \
#   --user yhat \
#   --repo rodeo-native \
#   --tag 0.2.1 \
#   --name "Rodeo-mac.dmg" \
#   --file build/darwin/x64/Rodeo-darwin-x64/Rodeo.dmg
