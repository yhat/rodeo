#!/bin/bash

VERSION=$(cat package.json | jq -r .version)
s3cmd -P put build/darwin/x64/Rodeo-darwin-x64/Rodeo.dmg "s3://rodeo-releases/${VERSION}/Rodeo-v${VERSION}-darwin_64.dmg"
s3cmd -P put build/darwin/x64/Rodeo-darwin-x64/Rodeo.zip "s3://rodeo-releases/${VERSION}/Rodeo-v${VERSION}-darwin_64.zip"
s3cmd -P put build/win32/all/Rodeo-win32-ia32.zip "s3://rodeo-releases/${VERSION}/Rodeo-v${VERSION}-windows_32.zip"
s3cmd -P put build/win32/all/Rodeo-win32-x64.zip "s3://rodeo-releases/${VERSION}/Rodeo-v${VERSION}-windows_64.zip"
# upload a sha for posterity
git rev-parse HEAD > /tmp/SHA && s3cmd -P put /tmp/SHA "s3://rodeo-releases/${VERSION}/SHA"
