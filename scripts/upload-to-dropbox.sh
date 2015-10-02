#!/bin/bash

set -ex


cp build/darwin/x64/Rodeo-darwin-x64/Rodeo.dmg ~/Dropbox-Yhat/yhat-box/greg/rodeo/dist/Rodeo-mac.dmg
cp build/win32/all/Rodeo-win32-x64/Rodeo\ Setup.exe ~/Dropbox-Yhat/yhat-box/greg/rodeo/dist/Rodeo-win32-x64.exe
cp build/win32/all/Rodeo-win32-ia32/Rodeo\ Setup.exe ~/Dropbox-Yhat/yhat-box/greg/rodeo/dist/Rodeo-win32-ia32.exe

VERSION=$(cat package.json | jq .version --raw-output)

mkdir ~/Dropbox-Yhat/yhat-box/greg/rodeo/dist/${VERSION}
cp ~/Dropbox-Yhat/yhat-box/greg/rodeo/dist/* ~/Dropbox-Yhat/yhat-box/greg/rodeo/dist/${VERSION}
