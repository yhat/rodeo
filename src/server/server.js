'use strict';

const fs = require('fs'),
  path = require('path'),
  express = require('express'),
  WebSocketServer = require('ws').Server,
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  md = require('../services/md'),
  client = require('../kernels/python/client'),
  findFile = require('../services/find-file'),
  preferences = require('../services/preferences'),
  log = require('../services/log').asInternal(__filename),
  USER_WD = process.cwd(),
  USER_HOME = require('os').homedir();

function startRodeo(app, port, host, wd) {
  const PORT = parseInt(port || process.env.PORT || '3000'),
    HOST = host || process.env.HOST || '0.0.0.0';

  log('info', 'The Rodeo is at: ' + HOST + ':' + PORT);
  log('info', '    host: ' + HOST);
  log('info', '    port: ' + PORT);
  log('info', '    wd: ' + wd);

  return app.listen(PORT, HOST);
}

function startWebSockets(server, python) {
  let wss = new WebSocketServer({server: server});

  wss.broadcast = function (data) {
    wss.clients.forEach(function (ws) {
      ws.sendJSON(data);
    });
  };

  wss.on('connection', function (ws) {

    ws.sendJSON = function (data) {
      if (ws.readyState == 1) {
        ws.send(JSON.stringify(data));
      }
    };

    if (python == null) {
      ws.sendJSON({msg: 'startup-error', error: 'matplotlib problem'});
    }

    ws.sendJSON({msg: 'refresh-variables'});
    ws.sendJSON({msg: 'refresh-packages'});
    // ws.sendJSON({ msg: 'set-working-directory', wd: global.USER_WD || '.' });

    ws.on('message', function (data) {
      let someData = JSON.parse(data);

      if (someData.msg == 'index-files') {
        findFile(ws);
      } else if (someData.msg == 'command') {
        python.executeStream(someData.command, someData.autocomplete == true, function (result) {
          result.command = someData.command;
          result.msg = 'command';
          ws.sendJSON(result);
        });
      }
    });
  });
}


module.exports = function (host, port, wd) {
  client.create().then(function (python) {
    let app, staticDir, profile, server;

    // if we're running as a subprocess, the parent that we're ready to go!
    if (process.send) {
      process.send({msg: 'ready'});
    }

    global.python = python;
    if (python === null) {
      log('error', 'python came back null');
      return;
    }

    // setup express
    app = express();
    // setup static assets route handler
    staticDir = path.join(__dirname, '..', '..', '/static');
    app.use(express.static(staticDir));
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    // parse application/json
    app.use(bodyParser.json({limit: '50mb'}));
    // logging
    app.use(morgan('dev'));


    app.get('/', function (req, res) {
      let filepath = path.join(staticDir, 'server-index.html');

      res.sendFile(filepath);
    });

    app.get('/command', function (req, res) {
      if (req.query.stream === 'true') {
        res.set('Content-Type', 'text/event-stream');
        python.executeStream(req.query.command, req.query.autocomplete === 'true', function (result) {
          result.command = req.query.command;
          res.write(JSON.stringify(result) + '\n');
          if (result.status === 'complete') {
            res.end();
          }
        });
      } else {
        python.execute(req.query.command, req.query.autocomplete === 'true', function (result) {
          result.command = req.query.command;
          result.status = 'complete';
          res.json(result);
        });
      }
    });

    app.get('/wd', function (req, res) {
      res.send(USER_WD);
    });

    app.post('/wd', function (req, res) {
      if (fs.existsSync(req.body.wd)) {
        // USER_WD = req.body.wd; //not a thing anymore, and also wow extremely dangerous
        res.send(USER_WD);
      } else {
        res.json({
          status: 'error',
          message: 'Filepath `' + req.body.wd + '` does not exist.'
        });
      }
    });

    // TODO: handle R stuff...
    app.get('/variable', function (req, res) {
      let varname, show_var_statements, command;

      varname = req.query.name;
      show_var_statements = {
        python: {
          DataFrame: 'print(' + varname + '[:1000].to_html())',
          Series: 'print(' + varname + '[:1000].to_frame().to_html())',
          list: 'pp.pprint(' + varname + ')',
          ndarray: 'pp.pprint(' + varname + ')',
          dict: 'pp.pprint(' + varname + ')'
        },
        r: {
          'data.frame': 'cat(print(xtable(' + varname + '), type="html"))',
          list: 'cat(' + varname + ')'
        }
      };

      command = show_var_statements['python'][req.query.type];
      python.execute(command, false, function (result) {
        let variable, html;

        // poor man's template...
        variable = result.output;
        variable = variable.replace('class="dataframe"', 'class="table table-bordered"');
        html = '<html><head><link id=\'rodeo-theme\' href=\'css/styles.css\' rel=\'stylesheet\'/></head><body>' + variable + '</body>';
        res.send(html);
      });
    });

    app.get('/files', function (req, res) {
      let dirname, files;

      dirname = path.resolve(req.query.dir || USER_WD);
      // USER_WD = dirname
      files = fs.readdirSync(dirname).map(function (filename) {
        return {
          filename: path.join(dirname, filename),
          basename: filename,
          isDir: fs.lstatSync(path.join(dirname, filename)).isDirectory()
        };
      });
      res.json({
        status: 'OK',
        files: files,
        dir: dirname,
        home: USER_HOME
      });
    });

    app.get('/file', function (req, res) {
      if (req.query.filepath) {
        fs.readFile(req.query.filepath, function (err, data) {
          if (err) {
            res.json({
              status: 'error',
              message: err.toString()
            });
          } else {
            res.json({
              status: 'OK',
              filepath: req.query.filepath,
              basename: path.basename(req.query.filepath),
              content: data.toString()
            });
          }
        });
      }
    });

    app.post('/file', function (req, res) {
      fs.writeFile(req.body.filepath, req.body.content, function (err) {
        if (err) {
          res.json({error: err});
        } else {
          res.json({
            status: 'OK',
            filepath: req.body.filepath,
            basename: path.basename(req.body.filepath)
          });
        }
      });
    });

    app.post('/md', function (req, res) {
      md.apply(req.body.doc, python, true, function (err, doc) {
        if (err) {
          log('error', err);
          return;
        }
        res.send(doc);
      });
    });

    app.get('/preferences', function (req, res) {
      res.json(preferences.getPreferences());
    });

    app.post('/preferences', function (req, res) {
      if (req.body.name && req.body.value) {
        preferences.setPreferences(req.body.name, req.body.value);
      }
      res.json(preferences.getPreferences());
    });

    app.get('/profile', function (req, res) {
      if (!profile) {
        profile = fs.readFileSync(path.join(__dirname, '..', '/rodeo/default-rodeo-profile.txt'));
      }
      res.send(profile);
    });

    app.post('/profile', function (req, res) {
      profile = req.body.profile;
      res.send(profile);
    });

    app.get('/about', function (req, res) {
      let filePath = path.join(staticDir, 'about.html');

      res.sendFile(filePath);
    });

    server = startRodeo(app, port, host, wd);

    startWebSockets(server, python);
  }).then(function (err) {
    log('error', err);
  });
};
