#!/bin/bash
./node_modules/.bin/gulp build
./scripts/osx/install-dist-deps.sh
cd app
npm install
cd ..
./node_modules/.bin/gulp dist:all
