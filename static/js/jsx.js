'use strict';

/**
 * Generates unique ids
 */

var guid = window.guid = function () {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return function () {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  };
}();
'use strict';

/**
 * Wrapper around ipcRenderer so we can wrap it later with something else
 * @type {{send: function, on: function}}
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
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var store = window.store = function () {
  function get(key) {
    var result = window.localStorage.getItem(key);

    if (result) {
      try {
        result = JSON.parse(result);
      } catch (ex) {
        // we're okay with this
      }
    }
    return result;
  }

  function set(key, value) {
    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
      value = JSON.stringify(value);
    }
    window.localStorage.setItem(key, value);
  }

  return {
    get: get,
    set: set
  };
}();
/* globals React */
'use strict';

var tourData = [{
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
/* globals React */
'use strict';

var DocCode = window.DocCode = React.createClass({
  displayName: "DocCode",

  propTypes: {
    text: React.PropTypes.string.isRequired
  },
  render: function render() {
    return React.createElement(
      "div",
      { className: "col-sm-8 col-sm-offset-2 text-left" },
      React.createElement(
        "pre",
        null,
        this.props.text
      )
    );
  }
});

DocCode.propTypes = {
  text: React.PropTypes.string.isRequired
};
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
        'Starting up...'
      )
    );
  }
});
/* globals React */
'use strict';

var ReportChecklistItem = window.ReportChecklistItem = function ReportChecklistItem(_ref) {
  var ok = _ref.ok;
  var label = _ref.label;

  return React.createElement(
    'li',
    { className: ok ? 'list-group-item list-group-item-success' : 'list-group-item list-group-item-danger' },
    label,
    React.createElement('span', { className: ok ? 'fa fa-check' : 'fa fa-times' })
  );
};

ReportChecklistItem.propTypes = {
  label: React.PropTypes.string.isRequired,
  ok: React.PropTypes.bool.isRequired
};
/* globals React, ReportChecklistItem */
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var ReportChecklist = window.ReportChecklist = function ReportChecklist(_ref) {
  var list = _ref.list;

  var elList = list.map(function (item, i) {
    return React.createElement(ReportChecklistItem, _extends({}, item, {
      key: i
    }));
  });

  return React.createElement(
    "ul",
    { className: "col-sm-4 col-sm-offset-4" },
    elList
  );
};

ReportChecklist.propTypes = {
  list: React.PropTypes.array.isRequired
};
/* globals React, ipc */
'use strict';

var SetupError = window.SetupError = function () {

  return React.createClass({
    displayName: 'SetupError',
    handleSendError: function handleSendError() {
      return ipc.send('send-error');
    },
    render: function render() {
      return React.createElement(
        'div',
        { className: 'setup-error container' },
        React.createElement(
          'div',
          { className: 'row possible-error' },
          React.createElement(
            'h2',
            null,
            'Looks like something has gone wrong.'
          ),
          React.createElement(
            'p',
            { className: 'lead' },
            'There might be something unique about your system that we didn\'t plan for.:'
          )
        ),
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'h2',
            null,
            'Help us out by sending the error message?'
          ),
          React.createElement(
            'p',
            { className: 'lead' },
            React.createElement(
              'a',
              { onClick: this.handleSendError },
              'Click here to report error'
            )
          )
        )
      );
    }
  });
}();
/* globals React, DocCode */
'use strict';

var SetupJupyter = window.SetupJupyter = React.createClass({
  displayName: 'SetupJupyter',

  propTypes: {
    onNewPythonPath: React.PropTypes.func.isRequired,
    onOpenDocs: React.PropTypes.func.isRequired,
    onOpenTerminal: React.PropTypes.func.isRequired,
    pythonPath: React.PropTypes.string.isRequired
  },
  handleTestPythonPath: function handleTestPythonPath() {
    this.props.onNewPythonPath(this.props.pythonPath);
  },
  handleChangePath: function handleChangePath() {
    this.props.onNewPythonPath('NEW PATH');
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
          { onClick: this.props.onOpenTerminal },
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
        React.createElement(DocCode, { text: '$ conda install jupyter' })
      ),
      React.createElement(
        'p',
        { className: 'lead' },
        'For pip users:'
      ),
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(DocCode, { text: '$ pip install jupyter' })
      ),
      React.createElement(
        'button',
        { className: 'btn btn-default',
          onClick: this.props.onOpenDocs
        },
        'Help'
      ),
      ' ',
      React.createElement(
        'button',
        { className: 'btn btn-info',
          onClick: this.handleChangePath
        },
        'Change Path'
      ),
      ' ',
      React.createElement(
        'button',
        { className: 'btn btn-primary',
          onClick: this.handleTestPythonPath
        },
        'Retry'
      )
    );
  }
});
/* globals React */
'use strict';

var SetupPython = window.SetupPython = function () {

  /**
   * @param {string} platform
   * @returns {string}
   */
  function getExamplePaths(platform) {
    var result = void 0;

    if (platform === 'win32') {
      result = 'i.e. C:\\Program Files\\Python 3.5\\python.exe, C:\\Users\\alf\\Anaconda\\envs\\py27\\python.exe';
    } else if (platform === 'linux' || platform === 'darwin') {
      result = 'i.e. /usr/bin/python, /Users/alf/anaconda/envs/py27/bin/python, /usr/local/bin/python';
    } else {
      result = 'python path';
    }

    return result;
  }

  return React.createClass({
    displayName: 'SetupPython',
    propTypes: {
      onInstallPython: React.PropTypes.func.isRequired,
      onSelect: React.PropTypes.func.isRequired,
      onSelectPythonDialog: React.PropTypes.func.isRequired,
      platform: React.PropTypes.oneOf(['win32', 'linux', 'darwin'])
    },
    getInitialState: function getInitialState() {
      return { pythonPath: '' };
    },
    handleChange: function handleChange(event) {
      var target = event.currentTarget || event.target;

      this.setState({ pythonPath: target.value });
    },
    handleSelectFromDialog: function handleSelectFromDialog() {
      var _this = this;

      this.props.onSelectPythonDialog().then(function (pythonPath) {
        return _this.setState({ pythonPath: pythonPath });
      }).catch(console.error);
    },
    handleSelect: function handleSelect() {
      this.props.onSelect(this.state.pythonPath);
    },
    render: function render() {
      var pythonPath = this.state.pythonPath,
          examplePaths = getExamplePaths(this.props.platform);

      return React.createElement(
        'div',
        { className: 'setup-python container' },
        React.createElement(
          'div',
          { className: 'row possible-error' },
          React.createElement(
            'h2',
            null,
            'Looks like we\'re having trouble finding your python.'
          ),
          React.createElement(
            'p',
            { className: 'lead' },
            'If you know your python path or command, paste it in the field below:'
          )
        ),
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'div',
            { className: 'form-group col-sm-10 col-offset-1' },
            React.createElement(
              'div',
              { className: 'input-group' },
              React.createElement('input', { className: 'form-control',
                onChange: this.handleChange,
                placeholder: examplePaths,
                type: 'text',
                value: pythonPath
              }),
              React.createElement(
                'div',
                { className: 'input-group-btn' },
                React.createElement(
                  'button',
                  { className: 'btn',
                    onClick: this.handleSelectFromDialog
                  },
                  '...'
                ),
                React.createElement(
                  'button',
                  { className: 'btn btn-primary',
                    disabled: !pythonPath,
                    onClick: this.handleSelect
                  },
                  'OK'
                )
              )
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'h2',
            null,
            'Python not installed?'
          ),
          React.createElement(
            'p',
            { className: 'lead' },
            React.createElement(
              'a',
              { onClick: this.props.onInstallPython },
              'Click here to install python'
            )
          )
        )
      );
    }
  });
}();
/* globals React, ipc */
'use strict';

var SetupReady = window.SetupReady = function () {

  return React.createClass({
    displayName: 'SetupReady',
    propTypes: {
      onReady: React.PropTypes.func.isRequired
    },
    render: function render() {
      return React.createElement(
        'div',
        { className: 'setup-ready container' },
        React.createElement(
          'div',
          { className: 'row' },
          React.createElement(
            'h2',
            null,
            'Ready to Rodeo!'
          ),
          React.createElement(
            'p',
            { className: 'lead' },
            React.createElement(
              'a',
              { onClick: this.props.onReady },
              'Yeehah!'
            )
          )
        )
      );
    }
  });
}();
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
/* globals $, React, ReactDOM, TourItem */
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Tour = window.Tour = React.createClass({
  displayName: 'Tour',

  propTypes: {
    onExitTour: React.PropTypes.func.isRequired,
    tourData: React.PropTypes.array.isRequired
  },
  componentDidMount: function componentDidMount() {
    $(ReactDOM.findDOMNode(this).querySelector('#tour')).owlCarousel({ singleItem: true });
  },
  render: function render() {
    var tourItems = this.props.tourData.map(function (item, i) {
      var props = item;

      return React.createElement(TourItem, _extends({}, props, {
        key: i
      }));
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
          onClick: this.props.onExitTour
        },
        'Enough of this tour, let\'s start Rodeo!'
      )
    );
  }
});
/* globals ipc, store, LoadingWidget, SetupPython, SetupError, SetupReady, Tour, tourData */
'use strict';

var Startup = window.Startup = function () {

  /**
   * @typedef {object} SystemFacts
   * @property {object} pythonOptions
   * @property {string} pythonOptions.cmd
   * @property {string} [pythonOptions.shell]
   * @property {Array} availablePythonKernels
   */

  /**
   * @param {Startup} component
   * @param {SystemFacts} facts
   */
  function setSystemFacts(component, facts) {
    store.set('systemFacts', facts);
    component.setState({ systemFacts: facts });
  }

  /**
   * @param {Startup} component
   */
  function chooseFirstKernel(component) {
    var facts = component.state.systemFacts,
        availablePythonKernels = facts && facts.availablePythonKernels,
        first = availablePythonKernels && availablePythonKernels[0],
        pythonOptions = first && first.pythonOptions;

    if (pythonOptions) {
      // just chose the first one, they can tell us we were wrong later
      store.set('pythonOptions', pythonOptions);
      component.setState({ pythonOptions: pythonOptions });
    }
  }

  return React.createClass({
    displayName: 'Startup',
    getInitialState: function getInitialState() {
      return {
        seenTour: store.get('seenTour'),
        pythonOptions: store.get('pythonOptions'),
        systemFacts: store.get('systemFacts')
      };
    },
    componentDidMount: function componentDidMount() {
      var _this = this;

      var state = this.state;

      if (!state.pythonOptions) {
        if (!state.systemFacts) {
          ipc.send('get_system_facts').then(function (facts) {
            return setSystemFacts(_this, facts);
          }).then(function () {
            return chooseFirstKernel(_this);
          }).catch(this.showError);
        } else {
          chooseFirstKernel(this);
        }
      }
    },
    /**
     * @param {Error} error
     */
    showError: function showError(error) {
      // todo: show something to user
      console.error(error);
    },
    close: function close() {
      return ipc.send('close_window', 'startupWindow');
    },
    handleInstallPython: function handleInstallPython() {
      return ipc.send('install_python');
    },
    handleSelectPythonDialog: function handleSelectPythonDialog() {
      return ipc.send('open_dialog', {
        title: 'Select your Python',
        properties: ['openFile'] }).then(function (result) {
        if (result.length && result.length > 0) {
          result = result[0];
        }

        return result;
      });
    },
    /**
     * @param {string} pythonCommand
     */
    handleSetPython: function handleSetPython(pythonCommand) {
      var pythonOptions = { cmd: pythonCommand };

      console.log('setting state', pythonOptions);

      this.setState({ pythonOptions: pythonOptions });
      store.set('pythonOptions', pythonOptions);
    },
    handleExitTour: function handleExitTour() {
      store.set('seenTour', true);
      this.close();
    },
    handleReady: function handleReady() {
      this.close();
    },
    render: function render() {
      var state = this.state;
      var content = void 0;

      if (!state.pythonOptions) {
        if (!state.systemFacts) {
          // we're getting the system facts
          content = React.createElement(LoadingWidget, null);
        } else {
          // no python in systemFacts, so ask them for it
          content = React.createElement(SetupPython, {
            onInstallPython: this.handleInstallPython,
            onSelect: this.handleSetPython,
            onSelectPythonDialog: this.handleSelectPythonDialog
          });
        }
      } else if (!state.seenTour) {
        content = React.createElement(Tour, { onExitTour: this.handleExitTour,
          tourData: tourData
        });
      }

      if (!content) {
        content = React.createElement(SetupReady, { onReady: this.handleReady });
      }

      return content;
    }
  });
}();
/* globals ipc, React, SetupJupyter, SetupPython, ReportChecklist */
'use strict';

var SetupTriage = window.SetupTriage = React.createClass({
  displayName: 'SetupTriage',

  propTypes: {
    onNewPythonPath: React.PropTypes.func.isRequired,
    pythonPath: React.PropTypes.string.isRequired,
    statusJupyter: React.PropTypes.bool.isRequired,
    statusPython: React.PropTypes.bool.isRequired
  },
  handleOpenDocs: function handleOpenDocs() {
    return ipc.send('open_external', 'http://rodeo.yhat.com/docs/');
  },
  handleOpenTerminal: function handleOpenTerminal() {
    return ipc.send('open_terminal');
  },
  render: function render() {
    var ready = void 0,
        python = void 0,
        jupyter = void 0;

    if (this.props.statusPython && this.props.statusJupyter) {
      ready = React.createElement(
        'p',
        { className: 'lead text-center' },
        'You\'re ready to Rodeo!'
      );
    }

    if (this.props.statusPython == false) {
      python = React.createElement(SetupPython, {
        onNewPythonPath: this.props.onNewPythonPath,
        onOpenDocs: this.handleOpenDocs
      });
    } else if (this.props.statusJupyter == false) {
      jupyter = React.createElement(SetupJupyter, {
        onNewPythonPath: this.props.onNewPythonPath,
        onOpenDocs: this.handleOpenDocs,
        pythonPath: this.props.pythonPath
      });
    }

    return React.createElement(
      'div',
      { className: 'row text-center',
        id: 'setup-triage'
      },
      ready,
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(ReportChecklist, { list: [{ ok: this.props.statusPython, label: 'Python PATH' }, { ok: this.props.statusJupyter, label: 'Jupyter' }]
        })
      ),
      React.createElement('br', null),
      python,
      jupyter
    );
  }
});
/* globals React */
'use strict';

var PythonSelectorItem = window.PythonSelectorItem = React.createClass({
  displayName: 'PythonSelectorItem',

  propTypes: {
    onClick: React.PropTypes.func.isRequired,
    pythonDefinition: React.PropTypes.object.isRequired,
    showDescription: React.PropTypes.bool,
    showVersion: React.PropTypes.bool
  },
  render: function render() {
    var pythonDefinition = this.props.pythonDefinition,
        packagesToFind = ['pandas', 'numpy', 'pytables', 'matplotlib'],
        pythonOptions = pythonDefinition.pythonOptions,
        checkResults = pythonDefinition.checkResults,
        packagesOfNote = checkResults && checkResults.packages && checkResults.packages.filter(function (item) {
      return packagesToFind.indexOf(item.name) > -1;
    }),
        label = pythonOptions.label || pythonOptions.cmd;
    var packagesOnDisplay = void 0,
        jupyterWarning = void 0,
        logo = void 0,
        version = void 0,
        description = void 0;

    if (packagesOfNote.length) {
      packagesOnDisplay = packagesOfNote.map(function (item) {
        var logoClass = 'logo-' + item.name,
            title = item.name + ' ' + item.version;

        return React.createElement('div', { className: logoClass,
          title: title
        });
      });
    } else {
      packagesOnDisplay = React.createElement('div', { className: 'packages-missing-warning' });
    }

    if (/Anaconda/.test(checkResults.version)) {
      logo = 'logo-anaconda';
    } else {
      logo = 'logo-python';
    }

    if (!checkResults.hasJupyterKernel) {
      jupyterWarning = React.createElement(
        'div',
        { className: 'jupyter-missing-warning' },
        'Jupyter was not found'
      );
    }

    if (this.props.showVersion !== false) {
      version = React.createElement(
        'div',
        { className: 'version code-value' },
        checkResults.version
      );
    }

    if (this.props.showDescription !== false) {
      description = React.createElement(
        'div',
        { className: 'description' },
        React.createElement(
          'div',
          { className: 'cmd code-value' },
          label
        ),
        version,
        jupyterWarning
      );
    }

    return React.createElement(
      'section',
      { className: 'python-selector-item' },
      React.createElement('header', { className: logo,
        title: checkResults.version
      }),
      description,
      React.createElement(
        'div',
        { className: 'packages-on-display' },
        packagesOnDisplay
      ),
      React.createElement(
        'footer',
        null,
        React.createElement(
          'button',
          { className: 'btn btn-default',
            onClick: this.props.onClick
          },
          'Select'
        )
      )
    );
  }
});
/* globals React, PythonSelectorItem */
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var PythonSelector = window.PythonSelector = React.createClass({
  displayName: "PythonSelector",

  propTypes: {
    onSelect: React.PropTypes.func.isRequired,
    pythonDefinitions: React.PropTypes.array.isRequired,
    showDescription: React.PropTypes.bool,
    showVersion: React.PropTypes.bool
  },
  handleClick: function handleClick() {
    this.props.onSelect(this, arguments);
  },
  render: function render() {
    var _this = this;

    var list = this.props.pythonDefinitions.map(function (pythonDefinition, i) {
      return React.createElement(PythonSelectorItem, _extends({ key: i,
        onClick: _this.handleClick,
        pythonDefinition: pythonDefinition
      }, _this.props));
    });

    return React.createElement(
      "div",
      { className: "python-selector" },
      React.createElement(
        "div",
        { className: "python-selector-list" },
        list
      )
    );
  }
});
//# sourceMappingURL=jsx.js.map
