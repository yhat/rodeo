# Rodeo Native

## Installation
Check the [releases](https://github.com/yhat/rodeo-native/releases) for the latest build. Download it, unzip, and double-click Rodeo!

## Dev
You'll need the following:
- node.js
- electron

Clone the repo and run:
```
$ electron .
```

## TODOs
- [x] node.js to ipython kernel module
    - [x] plots
    - [x] "null" displayed when there is nothing to display
    - [x] autocomplete
- [x] add "Set Working Directory" button on files UI
- [x] make headers and rows in all tables have the same width
- [x] implement "restart session"
- [x] shortcut for new editor
- [ ] column width same as the console in the editor
- [ ] autocomplete for packages names
- [ ] automatic go to next line is jumping all over the place
- [ ] search!!!
- [ ] run button
- [ ] autosave option
- [ ] ctrl + w for variable window
- [ ] help "table" size
- [ ] package table size
- [ ] focus bug w/ XXXXXXX
- [ ] stuff from editor not in terminal history
- [ ] fix "*" for unsaved files
- [ ] expand plot and save plot not working
- [ ] `setwd` in python instance
- [ ] setwd icon looks bad
- [x] code history not showing new lines
- [x] editors sometimes behave strangely. i think it's something to do with the IDs not being unique (think this is b/c you can have multiple `editor-1` if you open, close, then open again).
- [ ] preferences
- [ ] convert to LESS
- [ ] uglify/minify JS?
- [x] better responsive window sizing
- [x] build package
- [x] add in logo
- [x] plots not working ```([ERROR-2]: [Errno 2] No such file or directory: '../static/plots/1440334796-8e40484e-d335-4fec-b5bd-4481f8cbfd1e.png')```
- [ ] more "Rodeo specific" logo
