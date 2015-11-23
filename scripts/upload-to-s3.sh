#!/bin/bash

VERSION=$(cat package.json | jq -r .version)

echo "uploading OSX"
if [ -f build/darwin/x64/Rodeo-darwin-x64/Rodeo.dmg ]; then
 s3cmd -P put build/darwin/x64/Rodeo-darwin-x64/Rodeo.dmg "s3://rodeo-releases/${VERSION}/Rodeo-v${VERSION}-darwin_64.dmg"
fi
if [ -f build/darwin/x64/Rodeo-darwin-x64/Rodeo.zip ]; then
  s3cmd -P put build/darwin/x64/Rodeo-darwin-x64/Rodeo.zip "s3://rodeo-releases/${VERSION}/Rodeo-v${VERSION}-darwin_64.zip"
fi

echo "uploading Windows 32-bit"
if [ -f build/win32/all/Rodeo-win32-ia32.zip ]; then
  s3cmd -P put build/win32/all/Rodeo-win32-ia32.zip "s3://rodeo-releases/${VERSION}/Rodeo-v${VERSION}-windows_32.zip"
fi

if [ -f build/win32/all/Rodeo-win32-ia32/Rodeo\ Setup.exe ]; then
  s3cmd -P put build/win32/all/Rodeo-win32-ia32/Rodeo\ Setup.exe "s3://rodeo-releases/${VERSION}/Rodeo-v${VERSION}-windows_32.exe"
fi

echo "uploading Windows 64-bit"
if [ -f build/win32/all/Rodeo-win32-x64.zip ]; then
  s3cmd -P put build/win32/all/Rodeo-win32-x64.zip "s3://rodeo-releases/${VERSION}/Rodeo-v${VERSION}-windows_64.zip"
fi

if [ -f build/win32/all/Rodeo-win32-x64/Rodeo\ Setup.exe ]; then
  s3cmd -P put build/win32/all/Rodeo-win32-x64/Rodeo\ Setup.exe "s3://rodeo-releases/${VERSION}/Rodeo-v${VERSION}-windows_64.exe"
fi

# echo "uploading Debian 64-bit"
# echo "uploading Debian 32-bit"

# upload a sha for posterity
git rev-parse HEAD > /tmp/SHA && s3cmd -P put /tmp/SHA "s3://rodeo-releases/${VERSION}/SHA"
