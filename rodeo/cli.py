"""rodeo

Usage:
  rodeo [--port=<int>] [--no-browser] [--host=<IP>] [<directory>]
  rodeo (-h | --help)
  rodeo --version

Options:
  -h --help     Show this screen.
  --version     Show version.
  --port=<int>  Port you want to run the server on.
  --no-browser  Don't launch a web browser.
  --host=<IP>   The IP to listen on.

Help:
Rodeo is a data centric IDE for python. It leverages the IPython
Kernel but presents a different user experience than the notebook. 
Those of you who use products like SublimeText or Eclipse will
probably find rodeo familiar.

Examples:
To run a rodeo server, just execute the `rodeo` command like so:
    $ rodeo . # basic usage
    $ rodeo . --port=4567 # run in this directory, but on port 4567
    $ rodeo . --host=0.0.0.0 --no-browser # externally visible
    $ rodeo /path/to/a/folder # run in a different directory
    $ rodeo /path/to/a/folder --port=4567 # new directory, new port

"""
from .rodeo import main
from .__init__ import __version__

from docopt import docopt
import sys
import re

def cmd():
    arguments = docopt(__doc__, version="rodeo %s" % __version__)
    if arguments.get("<directory>"):
        active_dir = arguments.get("<directory>", ".")
        port = arguments.get("--port")
        browser = False if arguments.get("--no-browser") else True
        host = arguments.get("--host", None)
        kwargs = {"browser": browser}

        if port and re.match("^[0-9]+$", port):
            kwargs["port"] = int(port)
        if host and re.match("^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", host):
            kwargs["host"] = host

        main(active_dir, **kwargs)

    else:
        sys.stdout.write(__doc__)

if __name__=="__main__":
    cmd()
