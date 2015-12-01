#!/bin/bash

RELEASE="$1"

rm -rf build/ && \
  node scripts/build.js --all && \
  ./scripts/sign.sh && \
  ./scripts/release.sh

if [ "${RELEASE}" == "push" ]; then
  ./scripts/upload-to-s3.sh
fi
