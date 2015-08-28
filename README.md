# Rodeo Native

## Installation
Check the [releases](https://github.com/yhat/rodeo-native/releases) for the latest build. Download it, unzip, and double-click Rodeo!

## Dev
You'll need the following:
- node.js
- electron
- handlebars (npm install handlebars -g)
- uglifyjs (npm install uglify-js -g)
- lessc (npm install -g lessc)

Clone the repo and run:
```
$ electron .
```

To updated static assets are you change them, run `watch.sh`:

```
$ ./watch.sh
```

## TODOs
- [x] node.js to ipython kernel module
    - [x] plots
    - [x] "null" displayed when there is nothing to display
    - [x] autocomplete
      - [x] editor
      - [x] console
    - [x] autocomplete for packages names
- [ ] run button
- [x] uglify/minify JS?
- [x] Uncaught TypeError: path must be a string
      Uncaught TypeError: Cannot read property 'text' of undefined console.js:101
- [x] add "Set Working Directory" button on files UI
- [ ] make headers and rows in all tables have the same width
- [ ] data tables look a little funky
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
- [ ] multiline execute jumps around
    - [x] after highlight, things go nuts
    - [ ] ability to "know" if command is done yet when going line by line
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
