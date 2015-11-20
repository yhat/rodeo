#!/bin/bash

# codesign for OSX
if [ -d build/darwin/x64/Rodeo-darwin-x64/Rodeo.app ]; then
  codesign --deep --force --verbose --sign "Yhat, Inc." build/darwin/x64/Rodeo-darwin-x64/Rodeo.app
  codesign --verify -vvvv build/darwin/x64/Rodeo-darwin-x64/Rodeo.app
  spctl -a -vvvv build/darwin/x64/Rodeo-darwin-x64/Rodeo.app/
fi
