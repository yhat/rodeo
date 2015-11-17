# Rodeo Native

## Installation
Check the [releases](https://github.com/yhat/rodeo-native/releases) for the latest build. Download it, unzip, and double-click Rodeo!

## Dev
You'll need the following to run Rodeo in dev mode:
- node.js
- electron (npm install electron-prebuilt -g)

You'll need the following to actually develop Rodeo:
- electron-packager (npm install electron-packager -g)
- electron-builder (npm install electron-builder -g)
- handlebars (npm install handlebars -g)
- uglifyjs (npm install uglify-js -g)
- lessc (npm install -g less)

To run Rodeo in dev mode, clone the repo and run:
```
$ electron .
```

To updated static assets are you change them, run `watch.sh`:

```
$ ./watch.sh
```

## Building

### Executables (.exe, .app)
```
# build for just your OS
$ node scripts/build.js
# build for OSX, Windows, and Linux
$ node scripts/build.js --all
```

### Installers
https://github.com/aktau/github-release
```
$ ./scripts/release.sh
```

- https://github.com/sindresorhus/grunt-electron
- https://github.com/atom/grunt-electron-installer
- https://www.npmjs.com/package/grunt-electron-debian-installer
- https://github.com/maxogden/electron-packager


### Release everything
```bash
$ rm -rf build/ && node scripts/build.js --all && ./scripts/sign.sh && ./scripts/release.sh && ./scripts/upload-to-s3.sh
```
