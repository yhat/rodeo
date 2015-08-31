#!/bin/bash

electron-compile --target ./cache src/ static/ --verbose && node scripts/build.js && open build/darwin/x64/Rodeo-darwin-x64/Rodeo.app
