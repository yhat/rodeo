#!/bin/bash
./node_modules/.bin/gulp build
cd app
npm install
cd ..
./node_modules/.bin/gulp dist:all
