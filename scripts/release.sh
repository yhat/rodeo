#!/bin/bash

# osx
if [ -d build/darwin/x64/Rodeo-darwin-x64/Rodeo.app ]; then
  electron-builder build/darwin/x64/Rodeo-darwin-x64/Rodeo.app --platform=osx \
          --out=./build/darwin/x64/Rodeo-darwin-x64/ --config=packager.json

  ditto -ck --rsrc --sequesterRsrc --keepParent build/darwin/x64/Rodeo-darwin-x64/Rodeo.app \
    build/darwin/x64/Rodeo-darwin-x64/Rodeo.zip
fi

# windows
#   32 bit
if [ -d build/win32/all/Rodeo-win32-ia32 ]; then
  ditto -ck --rsrc --sequesterRsrc --keepParent build/win32/all/Rodeo-win32-ia32 \
    build/win32/all/Rodeo-win32-ia32.zip

  electron-builder build/win32/all/Rodeo-win32-ia32 --platform=win \
          --out=./build/win32/all --config=packager.json
fi

#   64 bit
if [ -d build/win32/all/Rodeo-win32-x64 ]; then
  ditto -ck --rsrc --sequesterRsrc --keepParent build/win32/all/Rodeo-win32-x64 \
    build/win32/all/Rodeo-win32-x64.zip

  electron-builder build/win32/all/Rodeo-win32-x64 --platform=win \
          --out=./build/win32/all --config=packager.json
fi

# linux
if [ -d ./build/linux/x64/Rodeo-linux-x64/ ]; then
  tar -zcvf ./build/linux/x64/Rodeo-linux-x64.tar.gz ./build/linux/x64/Rodeo-linux-x64/
fi

# if [ "$1"!="" ]; then
# 
#   echo "Release name? "
#   read NAME
#   echo "Release tag? "
#   read TAG
#   echo "Uploading release to GitHub:"
#   echo "  NAME: ${NAME}"
#   echo "  TAG: ${TAG}"
#   github-release release -u yhat -r rodeo-native -n "${NAME}" -d "${NAME}" --tag ${TAG}
#   github-release upload -u yhat -r rodeo-native --tag ${TAG} --name "Rodeo-mac.dmg" --file build/darwin/x64/Rodeo-darwin-x64/Rodeo.dmg
#   github-release upload -u yhat -r rodeo-native --tag ${TAG} --name "RodeoSetup-ia32.exe" --file build/win32/all/Rodeo-win32-ia32/Rodeo\ Setup.exe
#   github-release upload -u yhat -r rodeo-native --tag ${TAG} --name "RodeoSetup-x64.exe" --file build/win32/all/Rodeo-win32-x64/Rodeo\ Setup.exe
# 
# fi
