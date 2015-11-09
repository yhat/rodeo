doc = """
Rodeo Server

Usage:
  rodeo-worker [--port=<int>] [--host=<0.0.0.0>] [--wd=</home/hank>]
  rodeo-worker -h | --help
  rodeo-server -v | --version

Options:
  -h --help               show usage
  -v --version            show version and exit
  --port=<int>            http port to run on [default: 8000]
  --host=<0.0.0.0>        http host the app is running on [default: 0.0.0.0]
  --wd=</home/hank>       directory rodeo will start in [default: ~]

rodeo-web is a web application for running Rodeo in your browser. It seeks
to provide the same (or very similar) experience to running Rodeo on your
desktop, but from a modern browser like Chrome (sorry IE).
"""

{docopt} = require 'docopt'
options = docopt doc
pkg = require '../package'
server = require './server/server'


if options["--version"]
  console.log "Rodeo v#{pkg.version}"
else
  port = parseInt(options["--port"])
  host = options["--host"]
  wd = options["--wd"]
  server host, port, wd
