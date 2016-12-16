# Rodeo

## To run the project
You need the following to run Rodeo in dev mode:
- node.js
- electron (npm install electron-prebuilt -g)

Then from the root directory of the project:
```bash
npm install  # to install the dependences
npm run build # to build the project
npm start  # to run Rodeo
```

## To run the project with hot-swapping modules
```bash
npm install  # to install the dependences
npm run build  # to build the project
npm run build:browser-dev # to opt-in to hot-swapping modules
npm start  # to run Rodeo
```
and then in another console
```
npm run hot-server
```

## Distribution

### To cut a new version
```bash
npm version patch # to update the version for patches; use minor only for new features
git push && git push --tags # to give the new tag to github
```

Note that the update server doesn't like versions without downloadable parts, so everyone auto-update will
not working until the builds are uploaded to the release.

### To create for windows, linux and mac
Install the dependencies:
```bash
brew doctor
brew update
brew --version

# so we can build windows on mac
brew install Caskroom/cask/xquartz wine mono

# so we can build linux on mac
brew install gnu-tar libicns graphicsmagick
```

Then:
```bash
CSC_NAME=<some key sha identifier for signing> npm run dist:all
```

## To create only for mac
```bash
CSC_NAME=<some key sha identifier for signing> npm run dist:osx
```
