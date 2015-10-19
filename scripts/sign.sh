#!/bin/bash

# codesign for OSX
codesign --deep --force --verbose --sign "Yhat, Inc." build/darwin/x64/Rodeo-darwin-x64/Rodeo.app
codesign --verify -vvvv build/darwin/x64/Rodeo-darwin-x64/Rodeo.app
spctl -a -vvvv build/darwin/x64/Rodeo-darwin-x64/Rodeo.app/
