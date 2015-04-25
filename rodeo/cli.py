"""rodeo

Usage:
  rodeo [--verbose] [--no-browser] [--host=<IP>] [--port=<int>] [<directory>]
  rodeo (-h | --help)
  rodeo --version

Options:
  -h --help     Show this screen.
  --version     Show version.
  --verbose     Log info for debugging.
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
    $ rodeo . --verbose # run with excessive logging
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

        browser = True
        if arguments.get("--no-browser"):
            browser = False

        port = arguments.get("--port")
        if port and re.match("^[0-9]+$", port):
            port = int(port)
        else:
            port = None
        
        host = arguments.get("--host", None)
        if host and not re.match("^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$", host):
            host = None

        verbose = arguments.get("--verbose", False)

        main(active_dir, port=port, host=host, browser=browser, verbose=verbose)

    else:
        sys.stdout.write(__doc__)

if __name__=="__main__":
    cmd()
