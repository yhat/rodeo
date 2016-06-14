#!/bin/bash

# codesign for OSX
if [ -d dist/Rodeo-darwin-x64/Rodeo.app ]; then
  echo 'These are the valid codesigning ids:'
  security find-identity -vvvv -p codesigning

  echo 'This is the deep inspection of the current signature of the app:'
  codesign --deep --display -vvvv Rodeo.app

  echo 'These are the available Developer IDs:'
  certtool y | grep Developer\ ID

  # --sign    the action to take
  # --deep    sign all the things inside
  # --force   replace any existing signatures
  # --verify   the action to take
  codesign --verify -vvvv dist/Rodeo-darwin-x64/Rodeo.app
  spctl -a -vvvv --ignore-cache --no-cache dist/Rodeo-darwin-x64/Rodeo.app
fi
