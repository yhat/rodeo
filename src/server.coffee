express = require('express')
path = require('path')
hbs = require('express-hbs')
logger = require('morgan')
bodyParser = require('body-parser')
compress = require('compression')
favicon = require('serve-favicon')
methodOverride = require('method-override')
errorHandler = require('errorhandler')
fs = require('fs')
path = require("path")
uuid = require('uuid')
colors = require('colors')
spawn = require("child_process").spawn
require("shellscript").globalize()

delim = "\n"


# activeDir is the directory where we'll be reading/saving files. idea being
# like sublime (`subl .`, `subl /path/to/my/repo`)
module.exports = (activeDir, port) ->
  # nuke any plots that are inside the plots folder before we get going
  # for now we're not going to be preserving state. in the future we could
  # do something like R where we save session parameters in a .data file
  # but for now i think this seems the most intuitive
  fs.readdir path.join(__dirname, "..", "public", "plots"), (err, files) ->
    if err
      return
    files.forEach (f) ->
      f = path.join(__dirname, "..", "public", "plots", f)
      if /.png$/.test(f)
        fs.unlinkSync f

  # setup and configure express
  app = express()

  app.set 'port', parseInt(port)
  app.engine 'html', hbs.express4({
    partialsDir: path.join(__dirname, '..', 'views', 'partials'),
    defaultLayout: path.join(__dirname, '..', 'views', 'layout.html')
  })
  app.set 'views', path.join(__dirname, '..', 'views')
  app.set 'view engine', 'html'

  accessLog = fs.createWriteStream(path.join(__dirname, '..', 'access.log'), {flags: 'a'})

  app.use(compress())
     .use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')))
     .use(bodyParser())
     .use(methodOverride())
     .use(express.static(path.join(__dirname, "..", 'public')))
     # .use(logger('tiny', { stream: accessLog }))


  # TODO: remove dependency on `$()` since it's a pain to install
  packages = $("pip freeze").trim().split("\n")
  packages = packages.map (p) ->
    {
      name: p.split('==')[0],
      version: p.split('==')[1]
    }

  # routes
  app.get "/", (req, res) ->
    fs.readdir activeDir, (err, files) ->
      res.render "index", { layout: false, packages: packages, files: files }

  app.get "/plots", (req, res) ->
    fs.readdir path.join(__dirname, "..", "public", "plots"), (err, files) ->
      if err
        res.json { error: err }
      else
        files = files.map (f) ->
          "/plots/#{f}"
        files = files.filter (f) ->
          /.png$/.test(f)

        res.json { plots: files }

  app.get "/about", (req, res) ->
    res.render "about", { layout: false }

  # kernel that talks to python
  child = spawn("python", ["-u", path.join(__dirname, "..", "src", "kernel.py"), delim])

  # we'll print any feedback from the kernel as yellow text
  child.stderr.on "data", (data) ->
    process.stderr.write data.toString().yellow

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

  # when data comes back from the kernel, we need to route it to 
  # the correct request
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

  # basic file operations
  app.get "/file/:filename", (req, res) ->
    res.send fs.readFileSync path.join(activeDir, req.params.filename)

  app.post "/file", (req, res) ->
    fs.writeFile path.join(activeDir, req.body.filename), req.body.source, (err) ->
      res.send "OK"

  if app.get('env') == 'development'
    app.use errorHandler()

  app.listen app.get('port'), ->
    console.error "Running on directory #{activeDir} on http://localhost:#{app.get('port')}"

