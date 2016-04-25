'use strict';

/**
 * Wrapper around ipcRenderer so we can wrap it later with something else
 * @type {{send: function}}
 */

var ipc = window.ipc = function () {
  var cid = function () {
    var i = 0;return function () {
      return i++;
    };
  }(),
      ipcRender = require('electron').ipcRenderer;

  function toArgs(obj) {
    return Array.prototype.slice.call(obj, 0);
  }

  function on(emitter) {
    return function (eventName, eventFn) {
      try {
        emitter.on(eventName, function () {
          var eventResult = void 0,
              eventArgs = toArgs(arguments);

          eventResult = eventFn.apply(null, eventArgs);
          console.log('ipc event trigger completed', eventName, eventResult);
          return eventResult;
        });
        console.log('ipc event registered', eventName, eventFn.name);
        return emitter;
      } catch (ex) {
        console.error('ipc event error', eventName, ex);
      }
    };
  }

  function send(emitter) {
    return function () {
      var eventId = cid().toString(),
          args = toArgs(arguments),
          eventName = args[0];

      return new Promise(function (resolve, reject) {
        var _response = void 0,
            eventReplyName = eventName + '_reply';

        console.log('ipc sending', [eventName, eventId].concat(args.slice(1)));
        emitter.send.apply(emitter, [eventName, eventId].concat(args.slice(1)));
        _response = function response(event, id) {
          var result = void 0;
          if (id === eventId) {
            ipcRender.removeListener(eventReplyName, _response);
            result = toArgs(arguments).slice(2);
            if (result[0]) {
              reject(new Error(result[0].message));
            } else {
              resolve(result[1]);
            }
          } else {
            console.log(eventName, eventId, 'passed on', arguments);
          }
        };
        console.log('ipc waiting for ', eventName, eventId, 'on', eventReplyName);
        ipcRender.on(eventReplyName, _response);
      });
    };
  }

  return {
    send: send(ipcRender),
    on: on(ipcRender)
  };
}();
"use strict";

// <h1>Rodeo is starting up...</h1>
// <p className="lead">We're launching your python session. This should only take a moment or two.</p>
var LoadingWidget = window.LoadingWidget = React.createClass({
  displayName: "LoadingWidget",

  render: function render() {
    var style = {
      height: '200px'
    };

    return React.createElement(
      "div",
      { className: "text-center" },
      React.createElement("br", null),
      React.createElement("br", null),
      React.createElement("br", null),
      React.createElement("br", null),
      React.createElement("br", null),
      React.createElement("br", null),
      React.createElement("img", { src: "img/loading.gif",
        style: style
      }),
      React.createElement("br", null),
      React.createElement("br", null),
      React.createElement("br", null),
      React.createElement(
        "p",
        { className: "lead" },
        "Starting up..."
      )
    );
  }
});
'use strict';

var SetupJupyter = window.SetupJupyter = React.createClass({
  displayName: 'SetupJupyter',

  openTerminal: function openTerminal() {
    // if windows
    if (/win32/.test(process.platform)) {
      require('shell').openItem('cmd.exe');
    } else {
      require('shell').openItem('/Applications/Utilities/Terminal.app');
    }
  },
  handleOpenDocs: function handleOpenDocs() {
    require('shell').openExternal('http://rodeo.yhat.com/docs/');
  },
  handleTestPythonPath: function handleTestPythonPath() {
    this.props.testPythonPath(this.props.pythonPath);
  },
  handleChangePath: function handleChangePath() {
    this.props.testPythonPath('NEW PATH');
  },
  render: function render() {
    return React.createElement(
      'div',
      { className: 'row' },
      React.createElement(
        'h2',
        null,
        'Looks like you\'re missing ',
        React.createElement(
          'i',
          null,
          'jupyter'
        )
      ),
      React.createElement(
        'p',
        { className: 'lead' },
        React.createElement(
          'a',
          { onClick: this.openTerminal },
          'Click here to open the Terminal application'
        ),
        ' and run the command below:'
      ),
      React.createElement(
        'p',
        { className: 'lead' },
        'For Conda users:'
      ),
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'col-sm-8 col-sm-offset-2 text-left' },
          React.createElement(
            'pre',
            null,
            '$ conda install jupyter'
          )
        )
      ),
      React.createElement(
        'p',
        { className: 'lead' },
        'For pip users:'
      ),
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'col-sm-8 col-sm-offset-2 text-left' },
          React.createElement(
            'pre',
            null,
            '$ pip install jupyter'
          )
        )
      ),
      React.createElement(
        'button',
        { className: 'btn btn-default', onClick: this.handleOpenDocs },
        'Help'
      ),
      ' ',
      React.createElement(
        'button',
        { className: 'btn btn-info', onClick: this.handleChangePath },
        'Change Path'
      ),
      ' ',
      React.createElement(
        'button',
        { onClick: this.handleTestPythonPath, className: 'btn btn-primary' },
        'Retry'
      )
    );
  }
});
'use strict';

var SetupPython = window.SetupPython = React.createClass({
  displayName: 'SetupPython',

  getInitialState: function getInitialState() {
    return { pythonPath: '' };
  },
  pickPythonPath: function pickPythonPath() {
    var self = this;
    require('remote').dialog.showOpenDialog({
      title: "Select your Python",
      properties: ['openFile']
    }, function (pythonPath) {
      $("#pathval").val(pythonPath[0]);
      self.setState({ pythonPath: pythonPath[0] });
    });
  },
  setPythonPath: function setPythonPath() {
    this.props.testPythonPath(this.state.pythonPath);
  },
  updatePath: function updatePath() {
    var pythonPath = $("#pathval").val();
    this.setState({ pythonPath: pythonPath });
  },
  openTerminal: function openTerminal() {
    // if windows
    if (/win32/.test(process.platform)) {
      require('shell').openItem('cmd.exe');
    } else {
      require('shell').openItem('/Applications/Utilities/Terminal.app');
    }
  },
  render: function render() {
    var examplePaths = "i.e. /usr/bin/python, /Users/alf/anaconda/envs/py27/bin/python, /usr/local/bin/python";
    var whichPython = "which python";
    if (/win32/.test(process.platform)) {
      whichPython = "for %i in (python.exe) do @echo. %~$PATH:i";
      examplePaths = 'i.e. C:\\Program Files\\Python 3.5\\python.exe, C:\\Users\\alf\\Anaconda\\envs\\py27\\python.exe';
    }

    return React.createElement(
      'div',
      { className: 'row possible-error' },
      React.createElement(
        'h2',
        null,
        'Looks like we\'re having trouble finding your python path'
      ),
      React.createElement(
        'p',
        { className: 'lead' },
        'If you know your python path, paste it in the field below:'
      ),
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'form-group col-sm-10 col-sm-offset-1' },
          React.createElement(
            'div',
            { className: 'input-group' },
            React.createElement('input', { id: 'pathval', className: 'form-control', type: 'text', onChange: this.updatePath, readOnly: false, placeholder: examplePaths }),
            React.createElement(
              'div',
              { className: 'input-group-btn' },
              React.createElement(
                'button',
                { onClick: this.setPythonPath, className: 'btn btn-primary' },
                'Set Path'
              )
            )
          )
        )
      ),
      React.createElement(
        'div',
        { id: 'which-python', className: 'row' },
        React.createElement(
          'h2',
          null,
          'Don\'t know where your python path is?'
        ),
        React.createElement(
          'p',
          { className: 'lead' },
          React.createElement(
            'a',
            { onClick: this.openTerminal },
            'Click here to open the Terminal application'
          ),
          ' and run the command below:'
        ),
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'div',
            { className: 'col-sm-8 col-sm-offset-2 text-left' },
            React.createElement(
              'pre',
              null,
              whichPython
            )
          )
        )
      )
    );
  }
});
"use strict";

var SetupTriage = window.SetupTriage = React.createClass({
  displayName: "SetupTriage",

  render: function render() {
    var python;
    if (this.props.statusPython == false) {
      python = React.createElement(SetupPython, { testPythonPath: this.props.testPythonPath });
    }
    var jupyter;
    if (this.props.statusPython == true && this.props.statusJupyter == false) {
      jupyter = React.createElement(SetupJupyter, { pythonPath: this.props.pythonPath, testPythonPath: this.props.testPythonPath });
    }
    return React.createElement(
      "div",
      { id: "setup-triage", className: "row text-center" },
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "col-sm-4 col-sm-offset-4" },
          React.createElement(
            "li",
            { className: this.props.statusPython ? "list-group-item list-group-item-success" : "list-group-item list-group-item-danger" },
            "Python PATH ",
            React.createElement("i", { className: this.props.statusPython ? "fa fa-check" : "fa fa-times" })
          ),
          React.createElement(
            "li",
            { className: this.props.statusJupyter ? "list-group-item list-group-item-success" : "list-group-item list-group-item-danger" },
            "Jupyter ",
            React.createElement("i", { className: this.props.statusJupyter ? "fa fa-check" : "fa fa-times" })
          )
        )
      ),
      React.createElement("br", null),
      python,
      jupyter
    );
  }
});
/* globals ipc */
'use strict';

var Startup = window.Startup = React.createClass({
  displayName: 'Startup',

  getInitialState: function getInitialState() {
    return {
      status: 'loading',
      statusPython: false,
      statusJupyter: false,
      pythonPath: ''
    };
  },
  componentDidMount: function componentDidMount() {
    var self = this;

    ipc.send('get_system_facts').then(function (result) {
      var seenTour = window.localStorage.getItem('seenTour');
      var state = void 0;

      // reducer
      state = {
        status: !seenTour ? 'tour' : 'good to go',
        statusPython: result.pythonStarts === true,
        statusJupyter: result.python.hasJupyterKernel === true,
        pythonPath: result.pythonPath
      };

      console.log('hey');
      console.log('state', state);
      self.setState(state);
    }).catch(function (error) {
      var state = void 0;
      console.error(error);

      state = {
        status: 'error'
      };
      console.log('state', state);
      self.setState(state);
    });
  },
  testPythonPath: function testPythonPath(pythonPath) {
    // they entered a new python path to try and fix a bad one; test to see if it is okay.

    var state = this.state,
        self = this;

    state.pythonPath = pythonPath || state.pythonPath || 'NOTHING';
    state.status = 'loading';
    this.setState(state);

    setTimeout(function () {
      var state = void 0,
          result = ipc.send('test-path', pythonPath || 'NOTHING');

      if (result && result.python && result.jupyter) {

        state = {
          status: 'tour',
          statusPython: self.state.statusPython,
          statusJupyter: self.state.statusJupyter,
          pythonPath: self.state.pythonPath
        };
        console.log('state', state);
        self.setState(state);
      } else {
        state = {
          status: 'error',
          statusPython: result.python,
          statusJupyter: result.jupyter,
          pythonPath: pythonPath
        };
        console.log('state', state);
        self.setState(state);
      }
    }, 750);
  },
  render: function render() {
    var style = { backgroundColor: 'inherit' },
        content;

    if (this.state.status == 'loading') {
      content = React.createElement(LoadingWidget, null);
    } else if (this.state.status == 'error') {
      content = React.createElement(
        'div',
        null,
        React.createElement(SetupTriage, { pythonPath: this.state.pythonPath,
          statusJupyter: this.state.statusJupyter,
          statusPython: this.state.statusPython,
          testPythonPath: this.testPythonPath
        })
      );
    } else if (this.state.status == 'good to go') {
      content = React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          { className: 'lead text-center' },
          'You\'re ready to Rodeo!'
        ),
        React.createElement(SetupTriage, { pythonPath: this.state.pythonPath,
          statusJupyter: this.state.statusJupyter,
          statusPython: this.state.statusPython,
          testPythonPath: this.testPythonPath
        })
      );
    } else {
      content = React.createElement(Tour, null);
    }

    return React.createElement(
      'div',
      {
        className: 'jumbotron',
        style: style
      },
      content
    );
  }
});
'use strict';

/* globals React */

var TourItem = window.TourItem = React.createClass({
  displayName: 'TourItem',

  propTypes: {
    img: React.PropTypes.string.isRequired,
    img2: React.PropTypes.string.isRequired,
    subtitle: React.PropTypes.string.isRequired,
    title: React.PropTypes.string.isRequired
  },
  getDefaultProps: function getDefaultProps() {
    return {
      img: '',
      img2: '',
      title: ''
    };
  },
  render: function render() {
    var style = void 0,
        img = void 0;

    style = {
      maxWidth: '100%',
      maxHeight: '250px'
    };
    img = React.createElement('img', { src: this.props.img,
      style: style
    });
    if (this.props.img2) {
      img = React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'col-sm-6' },
          React.createElement('img', { src: this.props.img,
            style: style
          })
        ),
        React.createElement(
          'div',
          { className: 'col-sm-6' },
          React.createElement('img', { src: this.props.img2,
            style: style
          })
        )
      );
    }
    // noinspection HtmlUnknownAttribute,Eslint
    return React.createElement(
      'div',
      { className: 'text-center' },
      React.createElement(
        'h3',
        { className: 'text-primary' },
        this.props.title
      ),
      img,
      React.createElement('br', null),
      React.createElement('br', null),
      React.createElement('p', { className: 'lead', dangerouslySetInnerHTML: { __html: this.props.subtitle } })
    );
  }
});
/* globals $, ipc, React, ReactDOM */
'use strict';

var Tour = void 0,
    tourData = void 0;

tourData = [{
  title: 'Welcome to Rodeo!',
  subtitle: 'An IDE for Data Science',
  img: 'img/rodeo-logo.png',
  img2: null
}, {
  title: 'Autocomplete Your Code',
  subtitle: 'Use <kbd>tab</kbd> to autocomplete code from within the editor and the console.',
  img: 'img/tour/first/autocomplete.png',
  img2: null
}, {
  title: 'Plot and Analyze',
  subtitle: 'View plots without leaving Rodeo. Plots can be exported to your computer or saved for later.',
  img: 'img/tour/first/plots.png',
  img2: null
}, {
  img2: 'img/tour/first/viewer2.png',
  subtitle: 'Inspect your data using the <strong>Environment</strong> tab.',
  img: 'img/tour/first/viewer.png',
  title: 'View Datasets'
}, {
  title: 'Customize Your Rodeo Preferences',
  subtitle: 'Check out the <strong>Preferences</strong> tab to configure your Rodeo. Adjust the font size, change your syntax highlighting theme, setup your default working directory, and more!',
  img: 'img/tour/first/preferences.png',
  img2: null
}, {
  title: 'Bring your vim or emacs keyboard to Rodeo',
  subtitle: 'Use your favorite <strong>vim or emacs</strong> shortcuts. To setup vim/emacs, visit <strong>Preferences > Editor</strong>.',
  img: 'img/tour/first/vim-and-emacs-1.png',
  img2: null
}, {
  img2: 'img/tour/first/vim-and-emacs-2.png',
  subtitle: 'Create a <code>.rodeoprofile</code> to automatically load common libraries, functions, or datasets. Click <strong>CONFIGURE</strong> in the <strong>Preferences > General > Default Variables</strong> to access your <code>.rodeoprofile</code>.',
  img: 'img/tour/first/rodeo-profile.png',
  title: 'Setup Your Default Environment'
}, {
  title: 'Pick from One of Rodeo\'s Themes',
  subtitle: 'Select the theme that speaks to you.',
  img: 'img/tour/first/themes.png',
  img2: null
}, {
  title: 'Loaded with Shortcuts',
  subtitle: 'Shortcuts for everyting! Try <kbd>&#8984;</kbd> + <kbd>enter</kbd> to run code in the editor. Can\'t find a shortcut? No worries, visit <strong>Help > View Shortcuts</strong> to see them all!',
  img: 'img/tour/first/keyboard-shortcuts.png',
  img2: null
}, {
  title: 'Find Files Quickly',
  subtitle: 'Looking for a particular file? Try <kbd>&#8984;</kbd> + <kbd>t</kbd> to search your working directory.',
  img: 'img/tour/first/find-files.png',
  img2: null
}, {
  title: 'Let\'s Rodeo!',
  subtitle: 'Ok looks like you\'re ready to go! For more help visit <a onclick=\'shell.openExternal(\'http://yhat.github.io/rodeo-docs/docs/\');\'>the docs</a> or email <a>info@yhathq.com</a>.',
  img: 'img/tour/first/rodeo-celebration.png',
  img2: null
}];

Tour = window.Tour = React.createClass({
  displayName: 'Tour',

  componentDidMount: function componentDidMount() {
    $(ReactDOM.findDOMNode(this).querySelector('#tour')).owlCarousel({ singleItem: true });
  },
  exitTour: function exitTour() {
    ipc.send('exit-tour');
  },
  render: function render() {
    var tourItems = tourData.map(function (item) {
      var props = item;

      return React.createElement(TourItem, props);
    });

    return React.createElement(
      'div',
      { className: 'text-center' },
      React.createElement(
        'div',
        { id: 'tour' },
        tourItems
      ),
      React.createElement('br', null),
      React.createElement(
        'button',
        { className: 'btn btn-primary',
          onClick: this.exitTour
        },
        'Enough of this tour, let\'s start Rodeo!'
      )
    );
  }
});
//# sourceMappingURL=jsx.js.map
