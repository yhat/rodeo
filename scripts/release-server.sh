#!/bin/bash

test -d RodeoServer && rm -rf RodeoServer
mkdir RodeoServer
cp -R package.json RodeoServer/
cp -R src RodeoServer/
cp -R static RodeoServer/
cp -R node_modules RodeoServer/

TAR_NAME="RodeoServer-v$(cat package.json | jq -r .version).tar.gz"
tar czf $TAR_NAME RodeoServer
rm -rf RodeoServer
s3cmd put -P $TAR_NAME "s3://yhat-release/dists/${TAR_NAME}"
s3cmd put -P $TAR_NAME "s3://yhat-release/dists/RodeoServer-latest.tar.gz"
echo $TAR_NAME
