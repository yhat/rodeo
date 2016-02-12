var ipc = require('electron').ipcRenderer;

var Startup = React.createClass({
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
    ipc.on('setup-status', function(evt, data) {
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
          ipc.send('exit-tour');
        }
    });
  },
  testPythonPath: function(pythonPath) {
    var s = this.state;
    s.pythonPath = pythonPath || s.pythonPath || "NOTHING";
    s.status = 'loading';
    this.setState(s);

    var self = this;
    setTimeout(function() {
      var result = ipc.sendSync('test-path', pythonPath || "NOTHING");
      var status;
      if (result && result.python && result.jupyter) {
        status = "good to go";
        ipc.sendSync('launch-kernel', pythonPath);
        self.setState({
          status: "tour",
          statusPython: self.state.statusPython,
          statusJupyter: self.state.statusJupyter,
          pythonPath: self.state.pythonPath
        });
      } else {
        self.setState({
          status: "error",
          statusPython: result.python,
          statusJupyter: result.jupyter,
          pythonPath: pythonPath
        });
      }
    }, 750);
  },
  render: function() {
    var style = { backgroundColor: "inherit" };
    var content;
    if (this.state.status=="loading") {
      content = <LoadingWidget />;
    } else if (this.state.status=="error") {
      content = (
        <div>
          <SetupTriage pythonPath={this.state.pythonPath} statusPython={this.state.statusPython} statusJupyter={this.state.statusJupyter} testPythonPath={this.testPythonPath} />;
        </div>
      );
    } else if (this.state.status=="good to go"){
      content = (
        <div>
          <p className="lead text-center">You're ready to Rodeo!</p>
          <SetupTriage pythonPath={this.state.pythonPath} statusPython={this.state.statusPython} statusJupyter={this.state.statusJupyter} testPythonPath={this.testPythonPath} />;
        </div>
        );
    } else {
      content = <Tour />
    }
    return (
      <div className="jumbotron" style={style}>
        {content}
      </div>
    );
  }
});

  // <h1>Rodeo is starting up...</h1>
  // <p className="lead">We're launching your python session. This should only take a moment or two.</p>
var LoadingWidget = React.createClass({
  render: function() {
    var style={
      height: "200px"
    };
    return (
      <div className="text-center">
        <br />
        <br />
        <br />
        <br />
        <br />
        <br />
        <img src="img/loading.gif" style={style} />
        <br />
        <br />
        <br />
        <p className="lead">Starting up...</p>
      </div>
    );
  }
});

var SetupJupyter = React.createClass({
  openTerminal: function() {
    // if windows
    if (/win32/.test(process.platform)) {
      require('shell').openItem('cmd.exe');
    } else {
      require('shell').openItem('/Applications/Utilities/Terminal.app');
    }
  },
  openDocs: function() {
    require('shell').openExternal('http://rodeo.yhat.com/docs/');
  },
  testPythonPath: function() {
    this.props.testPythonPath(this.props.pythonPath);
  },
  changePath: function() {
    this.props.testPythonPath("NEW PATH");
  },
  render: function() {
    return (
      <div className="row">
        <h2>Looks like you're missing <i>jupyter</i></h2>
        <p className="lead">
          <a onClick={this.openTerminal}>Click here to open the Terminal application</a> and run the command below:
        </p>
        <p className="lead">For Conda users:</p>
        <div className="row">
          <div className="col-sm-8 col-sm-offset-2 text-left">
            <pre>$ conda install jupyter</pre>
          </div>
        </div>
        <p className="lead">For pip users:</p>
        <div className="row">
          <div className="col-sm-8 col-sm-offset-2 text-left">
            <pre>$ pip install jupyter</pre>
          </div>
        </div>
        <button className="btn btn-default" onClick={this.openDocs}>Help</button>
        &nbsp;
        <button className="btn btn-info" onClick={this.changePath}>Change Path</button>
        &nbsp;
        <button onClick={this.testPythonPath} className="btn btn-primary">Retry</button>
      </div>
    )
  }
});

var SetupPython = React.createClass({
  getInitialState: function() {
    return { pythonPath: '' };
  },
  pickPythonPath: function() {
    var self = this;
    require('remote').dialog.showOpenDialog({
      title: "Select your Python",
      properties: [ 'openFile' ]
    }, function(pythonPath) {
      $("#pathval").val(pythonPath[0]);
      self.setState({ pythonPath: pythonPath[0] });
    });
  },
  setPythonPath: function() {
    this.props.testPythonPath(this.state.pythonPath);
  },
  updatePath: function() {
    var pythonPath = $("#pathval").val();
    this.setState({ pythonPath: pythonPath });
  },
  openTerminal: function() {
    // if windows
    if (/win32/.test(process.platform)) {
      require('shell').openItem('cmd.exe');
    } else {
      require('shell').openItem('/Applications/Utilities/Terminal.app');
    }
  },
  render: function() {
    var examplePaths = "i.e. /usr/bin/python, /Users/alf/anaconda/envs/py27/bin/python, /usr/local/bin/python";
    var whichPython = "which python";
    if (/win32/.test(process.platform)) {
      whichPython = "for %i in (python.exe) do @echo. %~$PATH:i";
      examplePaths = "i.e. C:\\Program Files\\Python 3.5\\python.exe, C:\\Users\\alf\\Anaconda\\envs\\py27\\python.exe"
    }

    return (
      <div className="row possible-error">
        <h2>Looks like we're having trouble finding your python path</h2>
        <p className="lead">If you know your python path, paste it in the field below:</p>
        <div className="row">
          <div className="form-group col-sm-10 col-sm-offset-1">
            <div className="input-group">
              <input id="pathval" className="form-control" type="text" onChange={this.updatePath} readOnly={false} placeholder={examplePaths} />
              <div className="input-group-btn">
                <button onClick={this.setPythonPath} className="btn btn-primary">Set Path</button>
              </div>
            </div>
          </div>
        </div>
        <div id="which-python" className="row">
          <h2>Don't know where your python path is?</h2>
          <p className="lead">
            <a onClick={this.openTerminal}>Click here to open the Terminal application</a> and run the command below:
          </p>
          <div className="row">
            <div className="col-sm-8 col-sm-offset-2 text-left">
              <pre>{whichPython}</pre>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var SetupTriage = React.createClass({
  render: function() {
    var python;
    if (this.props.statusPython==false) {
      python = <SetupPython testPythonPath={this.props.testPythonPath} />;
    }
    var jupyter;
    if (this.props.statusPython==true && this.props.statusJupyter==false) {
      jupyter = <SetupJupyter pythonPath={this.props.pythonPath} testPythonPath={this.props.testPythonPath} />;
    }
    return (
      <div id="setup-triage" className="row text-center">
        <div className="row">
          <div className="col-sm-4 col-sm-offset-4">
            <li className={this.props.statusPython ? "list-group-item list-group-item-success": "list-group-item list-group-item-danger"}>
              Python PATH&nbsp;<i className={this.props.statusPython ? "fa fa-check": "fa fa-times"}></i>
            </li>
            <li className={this.props.statusJupyter ? "list-group-item list-group-item-success": "list-group-item list-group-item-danger"}>
              Jupyter&nbsp;<i className={this.props.statusJupyter ? "fa fa-check": "fa fa-times"}></i>
            </li>
          </div>
        </div>
        <br />
        {python}
        {jupyter}
      </div>
    );
  }
});


var TourItem = React.createClass({
  render: function() {
    var style = {
      maxWidth: '100%',
      maxHeight: '250px'
    }
    var img = <img src={this.props.img} style={style} />
    if (this.props.img2) {
      img = (
        <div className="row">
          <div className="col-sm-6">
            <img src={this.props.img} style={style} />
          </div>
          <div className="col-sm-6">
            <img src={this.props.img2} style={style} />
          </div>
        </div>
      );
    }
    return (
        <div className="text-center">
          <h3 className="text-primary">{this.props.title}</h3>
          {img}
          <br /><br />
          <p className="lead" dangerouslySetInnerHTML={ {__html: this.props.subtitle } }></p>
        </div>
    );
  }
});

var Tour = React.createClass({
  exitTour: function() {
    ipc.send('exit-tour');
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
      return <TourItem title={item.title} subtitle={item.subtitle} img={item.img} img2={item.img2} />
    });

    setTimeout(function() {
      $("#tour").owlCarousel({ singleItem: true });
    }, 50);

    return (
      <div className="text-center">
        <div id="tour">
          {tourItems}
        </div>
        <br />
        <button onClick={this.exitTour} className="btn btn-primary">Enough of this tour, let's start Rodeo!</button>
      </div>
    );
  }
});
