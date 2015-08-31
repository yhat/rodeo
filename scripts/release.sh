#!/bin/bash
# The .Trash thing seems very strange, but I don't argue with results:
#   http://stackoverflow.com/questions/18621467/error-creating-disk-image-using-hdutil

# OSX
rm -rf build/
electron-compile --target ./cache src/ static/ --verbose \
  && node scripts/build.js \
  && mkdir build/darwin/x64/Rodeo-darwin-x64/dmg/ \
  && cd build/darwin/x64/Rodeo-darwin-x64/dmg/ && ln -s /Applications && cd - \
  && touch build/darwin/x64/Rodeo-darwin-x64/dmg/.Trash \
  && mkdir build/darwin/x64/Rodeo-darwin-x64/dmg/.background \
  && cp -R build/darwin/x64/Rodeo-darwin-x64/Rodeo.app build/darwin/x64/Rodeo-darwin-x64/dmg/ \
  && hdiutil create -format UDZO -srcfolder build/darwin/x64/Rodeo-darwin-x64/dmg/ build/darwin/x64/Rodeo-darwin-x64/Rodeo.dmg \
  && rm -rf build/darwin/x64/Rodeo-darwin-x64/dmg/
