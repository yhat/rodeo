# Rodeo

## Installation
Check [rodeo-updates.yhat.com/latest](http://rodeo-updates.yhat.com/latest) for the latest release. Download it, unzip, and double-click Rodeo!

## Dev
You need the following to run Rodeo in dev mode:
- node.js
- electron (npm install electron-prebuilt -g)

You need the following to actually develop Rodeo:
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

## Distribution

### Executables (.exe, .app)
This will cross-compile apps...
```
# build for just your OS
$ node scripts/build.js
# build for OSX, Windows, and Linux
$ node scripts/build.js --all
```

### Installers
This will create installers...
```
$ ./scripts/release.sh
```

- https://github.com/sindresorhus/grunt-electron
- https://github.com/atom/grunt-electron-installer
- https://www.npmjs.com/package/grunt-electron-debian-installer
- https://github.com/maxogden/electron-packager


### Release everything
```bash
# release an RC version
$ ./scripts/build-and-release.sh rc
# release a real version
$ ./scripts/build-and-release push
```
