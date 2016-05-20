#!/bin/bash

# codesign for OSX
if [ -d dist/Rodeo-darwin-x64/Rodeo.app ]; then
  codesign -vvvv --deep --force --sign "Yhat, Inc." dist/Rodeo-darwin-x64/Rodeo-1.3.2.dmg
  codesign --verify -vvvv dist/Rodeo-darwin-x64/Rodeo.app
  spctl -a -vvvv dist/Rodeo-darwin-x64/Rodeo.app/
fi
