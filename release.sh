#!/bin/bash

electron-compile --target ./cache src/ static/ --verbose \
  && node scripts/build.js && \
  && hdiutil create -format UDZO -srcfolder build/darwin/x64/Rodeo-darwin-x64/Rodeo.app build/darwin/x64/Rodeo-darwin-x64/Rodeo.dmg
