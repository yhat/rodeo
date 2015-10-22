var fs = require('fs');
var path = require('path');
var express = require('express');
var WebSocketServer = require('ws').Server;
var bodyParser = require('body-parser');
var morgan = require('morgan');
// Rodeo stuff
var kernel = require('../rodeo/kernel');
var findFile = require('../rodeo/find-file');
var preferences = require('../rodeo/preferences');

var app = express();
// setup static assets route handler
app.use(express.static(path.join(__dirname, '..', '..', '/static')));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// logging
app.use(morgan('dev'));


global.python = null;
global.USER_WD = process.argv[2] || __dirname;
global.USER_HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];



kernel(function(err, python) {
  global.python = python;
  if (err) {
    console.log("[ERROR]: " + err);
  }
  if (python==null) {
    console.log("[ERROR]: python came back null");
  }
});

app.get('/', function(req, res) {
  var filepath = path.join(__dirname, '..', '..', './static/server-index.html');
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

app.get('/variable', function(req, res) {
  var varname = req.query.name
  var show_var_statements = {
    DataFrame: "print(" + varname + "[:1000].to_html())",
    Series: "print(" + varname + "[:1000].to_frame().to_html())",
    list: "pp.pprint(" + varname + ")",
    ndarray: "pp.pprint(" + varname + ")",
    dict: "pp.pprint(" + varname + ")"
  };

  var command = show_var_statements[req.query.type];
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
  var filepath = path.join(__dirname, '..', '..', './static/about.html');
  res.sendFile(filepath);
});

var PORT = parseInt(process.env.PORT || "3000");
var HOST = process.env.HOST || "0.0.0.0";
var server = app.listen(PORT, HOST);
console.log("The party is at: " + HOST + ":" + PORT);

var wss = new WebSocketServer({ server: server });

wss.on('connection', function (ws) {

  ws.sendJSON = function(data) {
    ws.send(JSON.stringify(data));
  }
  ws.sendJSON({ msg: 'refresh-variables' });
  ws.sendJSON({ msg: 'refresh-packages' });
  // ws.sendJSON({ msg: 'set-working-directory', wd: global.USER_WD || '.' });

  ws.on('message', function(data) {
    var data = JSON.parse(data);
    if (data.msg=="index-files") {
      findFile(ws);
    }
  });

});
