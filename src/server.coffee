express = require('express')
path = require('path')
hbs = require('express-hbs')
logger = require('morgan')
bodyParser = require('body-parser')
compress = require('compression')
favicon = require('static-favicon')
methodOverride = require('method-override')
errorHandler = require('errorhandler')
fs = require('fs')
path = require("path")
uuid = require('uuid')
spawn = require("child_process").spawn
delim = "\n"
require("shellscript").globalize()


module.exports = (activeDir) ->

  fs.readdir path.join(__dirname, "..", "public", "plots"), (err, files) ->
    if err
      return
    files.forEach (f) ->
      f = path.join(__dirname, "..", "public", "plots", f)
      fs.unlinkSync f

  app = express()

  app.set 'port', process.env.PORT || 3000
  app.engine 'html', hbs.express4({
    partialsDir: path.join(__dirname, '..', 'views', 'partials'),
    defaultLayout: path.join(__dirname, '..', 'views', 'layout.html')
  })
  app.set 'views', path.join(__dirname, '..', 'views')
  app.set 'view engine', 'html'

  app.use(compress())
     .use(favicon())
     .use(logger('dev'))
     .use(bodyParser())
     .use(methodOverride())
     .use(express.static(path.join(__dirname, "..", 'public')))


  packages = $("pip freeze").trim().split("\n")
  packages = packages.map (p) ->
    {
      name: p.split('==')[0],
      version: p.split('==')[1]
    }



  app.get "/", (req, res) ->
    fs.readdir path.join(activeDir), (err, files) ->
      res.render "index", { layout: false, packages: packages, files: files }

  app.get "/plots", (req, res) ->
    fs.readdir path.join(__dirname, "..", "public", "plots"), (err, files) ->
      if err
        res.json { error: err }
      else
        files = files.map (f) ->
          "/plots/#{f}"
        res.json { plots: files }

  app.get "/about", (req, res) ->
    res.render "about", { layout: false }


  child = spawn("python", ["-u", path.join(__dirname, "..", "src", "kernel.py"), delim])
  child.stdin.write JSON.stringify({ code: ""}) + delim

  chunk = ""
  child.stdout.on "data", (data) ->
    chunk += data.toString()

    while chunk.indexOf(delim) > -1
      idx = chunk.indexOf(delim)
      chunkette = chunk.slice(0, idx)
      output = JSON.parse(chunkette)
      chunk = chunk.slice(idx + 1)

      if callbacks[output.id]
        callbacks[output.id](output)
        delete callbacks[output.id]

  callbacks = {}
  app.post "/", (req, res) ->
    data = {
      id: uuid.v4().toString()
      code: req.body.code
    }
    payload = JSON.stringify(data) + delim
    
    callbacks[data.id] = (data) ->
      res.json data

    child.stdin.write payload

  app.get "/file/:filename", (req, res) ->
    res.send fs.readFileSync path.join(activeDir, req.params.filename)

  app.post "/file", (req, res) ->
    fs.writeFile path.join(activeDir, req.body.filename), req.body.source, (err) ->
      res.send "OK"

  if app.get('env') == 'development'
    app.use errorHandler()

  app.listen app.get('port'), ->
    console.error "Running on directory #{activeDir} on http://localhost:#{app.get('port')}"

