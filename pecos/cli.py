"""pecos

Usage:
  pecos [--port=<int>] [<directory>]
  pecos (-h | --help)
  pecos --version

Options:
  -h --help     Show this screen.
  --version     Show version.

"""
from app import main
from __init__ import __version__

from docopt import docopt
import sys
import re

def cmd():
    arguments = docopt(__doc__, version="pecos %s" % __version__)
    if arguments.get("<directory>"):
        active_dir = arguments.get("<directory>", ".")
        port = arguments.get("--port")
        if port and re.match("^[0-9]+$", port):
            main(active_dir, int(port))
        else:
            main(active_dir)
    else:
        sys.stdout.write(__doc__)

if __name__=="__main__":
    cmd()
