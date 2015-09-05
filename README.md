# Rodeo Native

## Installation
Check the [releases](https://github.com/yhat/rodeo-native/releases) for the latest build. Download it, unzip, and double-click Rodeo!

## Dev
You'll need the following:
- node.js
- electron
- electron-packager (npm install electron-packager -g)
- electron-builder (npm install electron-builder -g)
- handlebars (npm install handlebars -g)
- uglifyjs (npm install uglify-js -g)
- lessc (npm install -g less)

Clone the repo and run:
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

## Go To Market
- Rodeo go to market
    - [x] OSX support
    - [-] windows support
    - [ ] usage statistics / metrics
    - [ ] limited beta
    - [ ] marketing material
      - [ ] landing page
      - [ ] downloads page
    - [x] binary replacement for kernel?
        * __don't need it for v1 but would be nice to eventually have__
    - [ ] licensing
    - [ ] logo
    - [ ] sunset "old rodeo"
    - [ ] enterprise strategy / timeline

## Beta Testers

http://www.kdnuggets.com/2012/12/most-influential-data-scientists-on-twitter.html

- Peter Skomoroch: https://twitter.com/peteskomoroch/status/591275403701923841
- Olivier Grisel
- Wes McKinney
- Josh Wills: https://twitter.com/josh_wills
- Mark Faridani: https://twitter.com/siah
- Jeff Hammerbacher & friends
- [x] Glen Thompson
- [x] Charlie Hack
- Jeroen Janssens
- Chris Beaumont: https://github.com/ChrisBeaumont
- Spencer Boucher: https://github.com/justmytwospence (interviewed him a while ago. now at Uber)
- Lynn Cherny: https://twitter.com/arnicas (Owl Lady)
- Hilary Parker: https://twitter.com/hspter (Etsy)


```
Hi ________!

<insert personal tidbit>

I think you've heard of [Rodeo](https://github.com/yhat/rodeo)--I'm pretty sure I saw you tweeted or github-starred it or something. Anyways, we're releasing a new version that, to be frank, is way better (screenshot below). It runs native on OSX, Linux, and even Windows! All that's required is that you have IPython setup.

We're going to be doing a full release in the coming weeks, but I was wondering if you'd be interesting in getting a sneak peak. If you'd be up for giving it a try.

Thanks!

Greg

<screenshot>
```

## TODOs
- [x] node.js to ipython kernel module
    - [x] plots
    - [x] "null" displayed when there is nothing to display
    - [x] autocomplete
      - [x] editor
      - [x] console
    - [x] autocomplete for packages names
- [x] don't open file if it's already open
- [x] run button
- [x] cmd + t for file searching
- [x] uglify/minify JS?
- [x] Uncaught TypeError: path must be a string
      Uncaught TypeError: Cannot read property 'text' of undefined console.js:101
- [x] add "Set Working Directory" button on files UI
- [x] toggle display dotfiles
- [ ] !!! make headers and rows in all tables have the same width
- [ ] !!! data tables look a little funky
- [x] shell.showItemInFolder
- [x] shell.moveItemToTrash instead of delete?
- [x] metrics or something like it: https://github.com/atom/metrics and/or https://www.npmjs.com/package/universal-analytics
- [?] auto update: https://github.com/atom/electron/blob/master/docs/api/auto-updater.md, https://github.com/GitbookIO/nuts
- [-] OS support
  - [x] OSX
      - [x] fancy dmg/installer
  - [-] windows
      - [x] installer
      - [ ] scroll bars are always visible
      - [ ] height for panes is messed up
      - [x] python is undefined (?)
      - [x] openFile doesn't work for C:\any\dirs; needs to be C:\\any\\dirs
      - [x] ctrl + t is opening 4 files (?)
      - [?] for indexing files for cmd + t, things get a little hairy when you launch in a directory with lots of files (i.e. ~)
  - [ ] linux
    - [ ] ubuntu
    - [ ] fedora/redhat
- [ ] option pane on the icon at the bottom of the screen
- [x] alert if Rodeo is configured incorrectly
- [x] implement "restart session"
- [x] shortcut for new editor
- [?] column width same as the console in the editor
- [x] automatic go to next line is jumping all over the place
- [x] search!!!
- [x] preferences
- [x] fix python subprocess stuff
- [ ] Excel renderer
- [x] update file tree on save
- [x] multiline execute jumps around
    - [x] after highlight, things go nuts
    - [x] ability to "know" if command is done yet when going line by line
- [ ] on drastic change to editor, some things aren't visible
- [x] on restart session, run refreshVariables()
- [x] default working directory in preferences
- [ ] console font size
- [x] convert to LESS
- [x] bug on open files
- [x] shortcuts for running commands in your history
- [x] zoom in/out
- [x] autosave option
- [x] ctrl + w for variable window (can't quite figure this one out)
- [x] help "table" size
- [x] package table size
- [x] focus bug w/ XXXXXXX
- [x] stuff from editor not in terminal history
- [x] expand plot and save plot not working
- [x] `setwd` in python instance
- [x] setwd icon looks bad
- [x] code history not showing new lines
- [x] dialogs should open in current working directory
- [x] better responsive window sizing
- [x] build package
- [x] add in logo
- [x] plots not working ```([ERROR-2]: [Errno 2] No such file or directory: '../static/plots/1440334796-8e40484e-d335-4fec-b5bd-4481f8cbfd1e.png')```
- [ ] more "Rodeo specific" logo
- [x] fix "*" for unsaved files
- [x] editors sometimes behave strangely. i think it's something to do with the IDs not being unique (think this is b/c you can have multiple `editor-1` if you open, close, then open again).
