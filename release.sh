#!/bin/bash
# The .Trash thing seems very strange, but I don't argue with results:
#   http://stackoverflow.com/questions/18621467/error-creating-disk-image-using-hdutil

# OSX
rm -rf build/
electron-compile --target ./cache src/ static/ --verbose \
  && node scripts/build.js \
  && touch build/darwin/x64/Rodeo-darwin-x64/Rodeo.app/.Trash \
  && hdiutil create -format UDZO -srcfolder build/darwin/x64/Rodeo-darwin-x64/Rodeo.app build/darwin/x64/Rodeo-darwin-x64/Rodeo.dmg
