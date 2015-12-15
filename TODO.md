TODO
- [x] package up for Cluster install--just needs to work one time :)
- [x] package up for server install
    - [x] installable
    - [ ] rodeo user and/or user group
    - [x] /etc/init
        - systemd or upstart? or both?
        - start/stop/restart scripts
        - config file
- setup authentication for users
    - [x] add session/user support (feasible w/ passport and ssh2)
    - [ ] use USER_HOME and USER_WD for given user
- shortcuts
    - all global shortcuts
      - [x] global
      - [?] console
      - [x] editor
    - [-] key mapping?
- dialogs
    - [x] "Are you sure you want to do XYZ? (with 3 options)"
    - [-] file dialog
    - [x] Confirm yes/no
- docs/manual
- bugs
    - [x] run previous doing strange things
    - [x] save plot?
    - [x] restart session doing strange things
    - [-] shortcut mapping not correct anymore
    - [x] shortcuts in menu
    - [x] preferences
    - [x] plan for working directories
    - [x] bug w/ file nav not working
    - [x] cant open file on server version
    - [x] need route for server markdown thing
    - [x] display variables broken
    - [x] file indexer not responding well
    - [ ] editor cut-off bug
    - [ ] fix stdin
        * nicer stdin error
        * allow stdin
    - [ ] better Python/PATH detection
    - [x] font adjustments for Console and Editor
        * size
        * family
    - [x] packaging/distro on linux
    - [x] copy/paste on linux
    - [x] more variables in environments panel
    - [x] help shouldnt show in console
    - [ ] windows hangs when given a anaconda env python path
- features
    - [ ] "inline" mode
    - [ ] docstring autocomplete thingy
    - [ ] "excel viewer" for grid-like data
    - [ ] autocomplete w/ text from page
    - [ ] pop-out panels
        * make panels more modular (Polymer?)
    - [ ] in app docs?
- unknowns
    - [ ] figure out how `resources/` works
        * can we ship it w/ Python?
    - [ ] auto-updates for windows

- Bridge interested in Beta
