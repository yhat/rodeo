var Startup = React.createClass({displayName: "Startup",
  getInitialState: function() {
    return {
      status: 'loading',
      statusPython: false,
      statusJupyter: false,
      pythonPath: null
    };
  },
  componentDidMount: function() {
    var self = this;
    require('electron').ipcRenderer.on('setup-status', function(evt, data) {
        var s = self.state;
        s.statusPython = data.python;
        s.statusJupyter = data.jupyter;
        if (data.python==false || data.jupyter==false) {
          s.status = "error";
        } else if (data.isFirstRun==true) {
          s.status = "good to go";
          setTimeout(function() {
            self.setState({
              status: "tour",
              statusPython: self.state.statusPython,
              statusJupyter: self.state.statusJupyter,
              pythonPath: self.state.pythonPath
            });
          }, 1500);
        } else {
          s.status = "good to go";
        }
        self.setState(s);
        if (data.python==true && data.jupyter==true && data.isFirstRun==false) {
          // ain't our first Rodeo
          require('electron').ipcRenderer.send('exit-tour');
        }
    });
  },
  testPythonPath: function(pythonPath) {
    var s = this.state;
    s.pythonPath = pythonPath;
    this.setState(s);
    var result = require('electron').ipcRenderer.sendSync('test-path', pythonPath);
    var status;
    if (result.python && result.jupyter) {
      status = "good to go";
      var self = this;
      setTimeout(function() {
        self.setState({
          status: "tour",
          statusPython: self.state.statusPython,
          statusJupyter: self.state.statusJupyter,
          pythonPath: self.state.pythonPath
        });
      }, 1500);
    } else {
      status = "loading";
      var self = this;
      setTimeout(function() {
        self.setState({
          status: "error",
          statusPython: result.python,
          statusJupyter: result.jupyter,
          pythonPath: pythonPath
        });
      }, 1500);
    }
    this.setState({
      status: status,
      statusPython: result.python,
      statusJupyter: result.jupyter,
      pythonPath: pythonPath
    });
  },
  render: function() {
    var style = { backgroundColor: "inherit" };
    var content;
    if (this.state.status=="loading") {
      content = React.createElement(LoadingWidget, null);
    } else if (this.state.status=="error") {
      content = (
        React.createElement("div", null, 
          React.createElement(SetupTriage, {statusPython: this.state.statusPython, statusJupyter: this.state.statusJupyter, testPythonPath: this.testPythonPath}), ";"
        )
      );
    } else if (this.state.status=="good to go"){
      content = (
        React.createElement("div", null, 
          React.createElement("p", {className: "lead text-center"}, "You're ready to Rodeo!"), 
          React.createElement(SetupTriage, {statusPython: this.state.statusPython, statusJupyter: this.state.statusJupyter, testPythonPath: this.testPythonPath}), ";"
        )
        );
    } else {
      content = React.createElement(Tour, null)
    }
    return (
      React.createElement("div", {className: "jumbotron", style: style}, 
        content
      )
    );
  }
});

  // <h1>Rodeo is starting up...</h1>
  // <p className="lead">We're launching your python session. This should only take a moment or two.</p>
var LoadingWidget = React.createClass({displayName: "LoadingWidget",
  render: function() {
    var style={
      height: "200px"
    };
    return (
      React.createElement("div", {className: "text-center"}, 
        React.createElement("br", null), 
        React.createElement("br", null), 
        React.createElement("br", null), 
        React.createElement("br", null), 
        React.createElement("br", null), 
        React.createElement("br", null), 
        React.createElement("img", {src: "img/loading.gif", style: style}), 
        React.createElement("br", null), 
        React.createElement("br", null), 
        React.createElement("br", null), 
        React.createElement("p", {className: "lead"}, "Starting up...")
      )
    );
  }
});

var SetupJupyter = React.createClass({displayName: "SetupJupyter",
  openTerminal: function() {
    // if OSX
    // require('shell').openItem('/Applications/Utilities/Terminal.app');
  },
  openDocs: function() {
    require('shell').openExternal('http://rodeo.yhat.com/docs/');
  },
  render: function() {
    return (
      React.createElement("div", {className: "row"}, 
        React.createElement("h2", null, "Looks like you're missing ", React.createElement("i", null, "jupyter")), 
        React.createElement("p", {className: "lead"}, 
          React.createElement("a", {onClick: this.openTerminal}, "Click here to open the Terminal application"), " and run the command below:"
        ), 
        React.createElement("p", {className: "lead"}, "For Conda users:"), 
        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "col-sm-8 col-sm-offset-2 text-left"}, 
            React.createElement("pre", null, "$ conda install jupyter")
          )
        ), 
        React.createElement("p", {className: "lead"}, "For pip users:"), 
        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "col-sm-8 col-sm-offset-2 text-left"}, 
            React.createElement("pre", null, "$ pip install jupyter")
          )
        ), 
        React.createElement("button", {className: "btn btn-default", onClick: this.openDocs}, "Help"), 
        " ", 
        React.createElement("button", {onClick: this.props.testPythonPath, className: "btn btn-primary"}, "Retry")
      )
    )
  }
});

var SetupPython = React.createClass({displayName: "SetupPython",
  getInitialState: function() {
    return { pythonPath: '' };
  },
  pickPythonPath: function() {
    var self = this;
    require('remote').dialog.showOpenDialog({
      title: "Select your Python",
      properties: [ 'openFile' ]
    }, function(pythonPath) {
      self.setState({ pythonPath: pythonPath[0] });
    });
  },
  setPythonPath: function() {
    this.props.testPythonPath(this.state.pythonPath);
  },
  openTerminal: function() {
    // if osx
    require('shell').openItem('/Applications/Utilities/Terminal.app');
  },
  render: function() {
    return (
      React.createElement("div", {className: "row possible-error"}, 
        React.createElement("h2", null, "Looks like we're having trouble finding your python path"), 
        React.createElement("p", {className: "lead"}, "If you know your python path, paste it in the field below:"), 
        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "form-group col-sm-10 col-sm-offset-1"}, 
            React.createElement("div", {className: "input-group"}, 
              React.createElement("input", {className: "form-control", type: "text", readOnly: true, value: this.state.pythonPath}), 
              React.createElement("div", {className: "input-group-btn"}, 
                React.createElement("button", {onClick: this.pickPythonPath, className: "btn btn-default"}, "Select Path")
              ), 
              React.createElement("div", {className: "input-group-btn"}, 
                React.createElement("button", {onClick: this.setPythonPath, className: "btn btn-primary"}, "Set Path")
              )
            )
          )
        ), 
        React.createElement("div", {id: "which-python", className: "row"}, 
          React.createElement("h2", null, "Don't know where your python path is?"), 
          React.createElement("p", {className: "lead"}, 
            React.createElement("a", {onClick: this.openTerminal}, "Click here to open the Terminal application"), " and run the command below:"
          ), 
          React.createElement("div", {className: "row"}, 
            React.createElement("div", {className: "col-sm-8 col-sm-offset-2 text-left"}, 
              React.createElement("pre", null, "$ which python")
            )
          )
        )
      )
    );
  }
});

var SetupTriage = React.createClass({displayName: "SetupTriage",
  render: function() {
    var python;
    if (this.props.statusPython==false) {
      python = React.createElement(SetupPython, {testPythonPath: this.props.testPythonPath});
    }
    var jupyter;
    if (this.props.statusPython==true && this.props.statusJupyter==false) {
      jupyter = React.createElement(SetupJupyter, {testPythonPath: this.props.testPythonPath});
    }
    // if (this.props.statusPython==true && this.props.statusJupyter) {
    //   setTimeout(function() {
    //     $("#setup-triage").css("opacity", 1).animate({ opacity: 0, duration: 250 });
    //   }, 500);
    // }
    return (
      React.createElement("div", {id: "setup-triage", className: "row text-center"}, 
        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "col-sm-4 col-sm-offset-4"}, 
            React.createElement("li", {className: this.props.statusPython ? "list-group-item list-group-item-success": "list-group-item list-group-item-danger"}, 
              "Python PATH ", React.createElement("i", {className: this.props.statusPython ? "fa fa-check": "fa fa-times"})
            ), 
            React.createElement("li", {className: this.props.statusJupyter ? "list-group-item list-group-item-success": "list-group-item list-group-item-danger"}, 
              "Jupyter ", React.createElement("i", {className: this.props.statusJupyter ? "fa fa-check": "fa fa-times"})
            )
          )
        ), 
        React.createElement("br", null), 
        python, 
        jupyter
      )
    );
  }
});


var TourItem = React.createClass({displayName: "TourItem",
  render: function() {
    var style = {
      maxWidth: '100%',
      maxHeight: '250px'
    }
    var img = React.createElement("img", {src: this.props.img, style: style})
    if (this.props.img2) {
      img = (
        React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "col-sm-6"}, 
            React.createElement("img", {src: this.props.img, style: style})
          ), 
          React.createElement("div", {className: "col-sm-6"}, 
            React.createElement("img", {src: this.props.img2, style: style})
          )
        )
      );
    }
    return (
        React.createElement("div", {className: "text-center"}, 
          React.createElement("h3", {className: "text-primary"}, this.props.title), 
          img, 
          React.createElement("br", null), React.createElement("br", null), 
          React.createElement("p", {className: "lead", dangerouslySetInnerHTML:  {__html: this.props.subtitle} })
        )
    );
  }
});

var Tour = React.createClass({displayName: "Tour",
  exitTour: function() {
    require('electron').ipcRenderer.send('exit-tour');
  },
  render: function() {
    var data = [
      {
        "title": "Welcome to Rodeo!",
        "subtitle": "An IDE for Data Science",
        "img": "img/rodeo-logo.png",
        "img2": null
      },
      {
        "title": "Autocomplete Your Code",
        "subtitle": "Use <kbd>tab</kbd> to autocomplete code from within the editor and the console.",
        "img": "img/tour/first/autocomplete.png",
        "img2": null
      },
      {
        "title": "Plot and Analyze",
        "subtitle": "View plots without leaving Rodeo. Plots can be exported to your computer or saved for later.",
        "img": "img/tour/first/plots.png",
        "img2": null
      },
      {
        "img2": "img/tour/first/viewer2.png",
        "subtitle": "Inspect your data using the <strong>Environment</strong> tab.",
        "img": "img/tour/first/viewer.png",
        "title": "View Datasets"
      },
      {
        "title": "Customize Your Rodeo Preferences",
        "subtitle": "Check out the <strong>Preferences</strong> tab to configure your Rodeo. Adjust the font size, change your syntax highlighting theme, setup your default working directory, and more!",
        "img": "img/tour/first/preferences.png",
        "img2": null
      },
      {
        "title": "Bring your vim or emacs keyboard to Rodeo",
        "subtitle": "Use your favorite <strong>vim or emacs</strong> shortcuts. To setup vim/emacs, visit <strong>Preferences > Editor</strong>.",
        "img": "img/tour/first/vim-and-emacs-1.png",
        "img2": null
      },
      {
        "img2": "img/tour/first/vim-and-emacs-2.png",
        "subtitle": "Create a <code>.rodeoprofile</code> to automatically load common libraries, functions, or datasets. Click <strong>CONFIGURE</strong> in the <strong>Preferences > General > Default Variables</strong> to access your <code>.rodeoprofile</code>.",
        "img": "img/tour/first/rodeo-profile.png",
        "title": "Setup Your Default Environment"
      },
      {
        "title": "Pick from One of Rodeo's Themes",
        "subtitle": "Select the theme that speaks to you.",
        "img": "img/tour/first/themes.png",
        "img2": null
      },
      {
        "title": "Loaded with Shortcuts",
        "subtitle": "Shortcuts for everyting! Try <kbd>&#8984;</kbd> + <kbd>enter</kbd> to run code in the editor. Can't find a shortcut? No worries, visit <strong>Help > View Shortcuts</strong> to see them all!",
        "img": "img/tour/first/keyboard-shortcuts.png",
        "img2": null
      },
      {
        "title": "Find Files Quickly",
        "subtitle": "Looking for a particular file? Try <kbd>&#8984;</kbd> + <kbd>t</kbd> to search your working directory.",
        "img": "img/tour/first/find-files.png",
        "img2": null
      },
      {
        "title": "Let's Rodeo!",
        "subtitle": "Ok looks like you're ready to go! For more help visit <a onclick=\"shell.openExternal('http://yhat.github.io/rodeo-docs/docs/');\">the docs</a> or email <a>info@yhathq.com</a>.",
        "img": "img/tour/first/rodeo-celebration.png",
        "img2": null
      }
    ]
    var tourItems = data.map(function(item) {
      return React.createElement(TourItem, {title: item.title, subtitle: item.subtitle, img: item.img, img2: item.img2})
    });

    setTimeout(function() {
      $("#tour").owlCarousel({ singleItem: true });
    }, 50);

    return (
      React.createElement("div", {className: "text-center"}, 
        React.createElement("div", {id: "tour"}, 
          tourItems
        ), 
        React.createElement("br", null), 
        React.createElement("button", {onClick: this.exitTour, className: "btn btn-primary"}, "Enough of this tour, let's start Rodeo!")
      )
    );
  }
});
