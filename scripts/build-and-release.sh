#!/bin/bash

rm -rf build/ && \
  node scripts/build.js --all && \
  ./scripts/sign.sh && \
  ./scripts/release.sh \
  && ./scripts/upload-to-s3.sh
