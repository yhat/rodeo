#!/bin/bash

VERSION=$(cat package.json | jq -r .version)
s3cmd -P put build/darwin/x64/Rodeo-darwin-x64/Rodeo.zip "s3://rodeo-releases/${VERSION}/Rodeo-v${VERSION}-darwin_64.zip"
