var fs = require('fs');
var path = require('path');
var express = require('express');
var WebSocketServer = require('ws').Server;
var bodyParser = require('body-parser');
var morgan = require('morgan');
var tmp = require('tmp');
// Rodeo stuff
var md = require('../rodeo/md');
var kernel = require('../rodeo/kernel');
var findFile = require('../rodeo/find-file');
var preferences = require('../rodeo/preferences');


module.exports = function(host, port, wd) {

  // setup express
  var app = express();
  // setup static assets route handler
  var staticDir = path.join(__dirname, '..', '..', '/static');
  app.use(express.static(staticDir));
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
  // parse application/json
  app.use(bodyParser.json({limit: '50mb'}));
  // logging
  app.use(morgan('dev'));


  global.python = null;
  global.USER_WD = wd || __dirname;
  global.USER_HOME = USER_WD.split("/").slice(0, 3).join("/");

  kernel(function(err, python) {
    // if we're running as a subprocess, the parent that we're ready to go!
    if (process.send) {
      process.send({ msg: 'ready' });
    }

    global.python = python;
    if (err) {
      console.log("[ERROR]: " + err);
      // wss.broadcast({ msg: 'startup-error', err: err });
      return;
    }
    if (python==null) {
      console.log("[ERROR]: python came back null");
      // wss.broadcast({ msg: 'startup-error', err: err });
      return;
    }
    python.execute("cd " + USER_WD);
  });

  app.get('/', function(req, res) {
    var filepath = path.join(staticDir, 'server-index.html');
    res.sendFile(filepath);
  });

  app.get('/command', function(req, res) {
    if (req.query.stream=='true') {
      res.set('Content-Type', 'text/event-stream');
      python.executeStream(req.query.command, req.query.autocomplete=="true", function(result) {
        result.command = req.query.command;
        res.write(JSON.stringify(result) + '\n');
        if (result.status=="complete") {
          res.end()
        }
      });
    } else {
      python.execute(req.query.command, req.query.autocomplete=="true", function(result) {
        result.command = req.query.command;
        result.status = "complete";
        res.json(result);
      });
    }
  });

  app.get('/wd', function(req, res) {
    res.send(USER_WD);
  });

  app.post('/wd', function(req, res) {
    if (fs.existsSync(req.body.wd)) {
      USER_WD = req.body.wd;
      res.send(USER_WD);
    } else {
      res.json({
        status: "error",
        message: "Filepath `" + req.body.wd + "` does not exist."
      });
    }
  });

  // TODO: handle R stuff...
  app.get('/variable', function(req, res) {
    var varname = req.query.name
    var show_var_statements = {
      python: {
        DataFrame: "print(" + varname + "[:1000].to_html())",
        Series: "print(" + varname + "[:1000].to_frame().to_html())",
        list: "pp.pprint(" + varname + ")",
        ndarray: "pp.pprint(" + varname + ")",
        dict: "pp.pprint(" + varname + ")"
      },
      r: {
        "data.frame": 'cat(print(xtable(' + varname + '), type="html"))',
        list: "cat(" + varname + ")"
      }
    };

    var command = show_var_statements["python"][req.query.type];
    python.execute(command, false, function(result) {
      // poor man's template...
      var variable = result.output;
      variable = variable.replace('class="dataframe"', 'class="table table-bordered"');
      var html = "<html><head><link id=\"rodeo-theme\" href=\"css/styles.css\" rel=\"stylesheet\"/></head><body>" + variable + "</body>";
      res.send(html);
    });
  });

  app.get('/files', function(req, res) {
    var dirname = path.resolve(req.query.dir || USER_WD);
    USER_WD = dirname
    var files = fs.readdirSync(dirname).map(function(filename) {
      return {
        filename: path.join(dirname, filename),
        basename: filename,
        isDir: fs.lstatSync(path.join(dirname, filename)).isDirectory()
      }
    });
    res.json({
      status: "OK",
      files: files,
      dir: dirname,
      home: USER_HOME,
    });
  });

  app.get('/file', function(req, res) {
    if (req.query.filepath) {
      fs.readFile(req.query.filepath, function(err, data) {
        if (err) {
          res.json({
            status: "error",
            message: err.toString()
          });
        } else {
          res.json({
            status: "OK",
            filepath: req.query.filepath,
            basename: path.basename(req.query.filepath),
            content: data.toString()
          });
        }
      });
    }
  });

  app.post('/file', function(req, res) {
    fs.writeFile(req.body.filepath, req.body.content, function(err) {
      if (err) {
        res.json({ error: err });
      } else {
        res.json({
          status: "OK",
          filepath: req.body.filepath,
          basename: path.basename(req.body.filepath)
        });
      }
    });
  });

  app.post('/md', function(req, res) {
    md(req.body.doc, python, true, function(err, doc) {
      res.send(doc);
    });
  });

  app.get('/preferences', function(req, res) {
    res.json(preferences.getPreferences());
  });

  app.post('/preferences', function(req, res) {
    if (req.body.name && req.body.value) {
      preferences.setPreferences(req.body.name, req.body.value);
    }
    res.json(preferences.getPreferences());
  });

  var profile;
  app.get('/profile', function(req, res) {
    if (profile==null) {
      profile = fs.readFileSync(path.join(__dirname, '..', '/rodeo/default-rodeo-profile.txt'));
    }
    res.send(profile);
  });

  app.post('/profile', function(req, res) {
    profile = req.body.profile;
    res.send(profile);
  });

  app.get('/about', function(req, res) {
    var filepath = path.join(staticDir, 'about.html');
    res.sendFile(filepath);
  });

  var PORT = parseInt(port || process.env.PORT || "3000");
  var HOST = host || process.env.HOST || "0.0.0.0";
  var server = app.listen(PORT, HOST);
  console.log("The Rodeo is at: " + HOST + ":" + PORT);
  console.log("    host: " + HOST);
  console.log("    port: " + PORT);
  console.log("    wd: " + wd);

  var wss = new WebSocketServer({ server: server });
  wss.broadcast = function(data) {
    wss.clients.forEach(function(ws) {
      ws.sendJSON(data);
    });
  };

  wss.on('connection', function (ws) {

    ws.sendJSON = function(data) {
      if (ws.readyState==1) {
        ws.send(JSON.stringify(data));
      }
    }

    if (python==null) {
      ws.sendJSON({ msg: 'startup-error', error: "matplotlib problem" });
    }

    ws.sendJSON({ msg: 'refresh-variables' });
    ws.sendJSON({ msg: 'refresh-packages' });
    // ws.sendJSON({ msg: 'set-working-directory', wd: global.USER_WD || '.' });

    ws.on('message', function(data) {
      var data = JSON.parse(data);
      if (data.msg=="index-files") {
        findFile(ws);
      } else if (data.msg=="command") {
        python.executeStream(data.command, data.autocomplete==true, function(result) {
          result.command = data.command;
          result.msg = "command"
          ws.sendJSON(result);
        });
      }
    });

  });

}
