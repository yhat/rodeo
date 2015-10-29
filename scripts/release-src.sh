#!/bin/bash

test -d Rodeo && rm -rf Rodeo
mkdir Rodeo
cp -R package.json Rodeo/
cp -R src Rodeo/
cp -R static Rodeo/
cp -R node_modules Rodeo/

TAR_NAME="Rodeo-v$(cat package.json | jq -r .version).tar.gz"
tar czf $TAR_NAME Rodeo
rm -rf Rodeo
s3cmd put -P $TAR_NAME "s3://yhat-release/dists/${TAR_NAME}"
s3cmd put -P $TAR_NAME "s3://yhat-release/dists/Rodeo-latest.tar.gz"
echo $TAR_NAME
