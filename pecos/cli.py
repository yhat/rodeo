"""pecos

Usage:
  pecos [--port=<int>] [<directory>]
  pecos (-h | --help)
  pecos --version

Options:
  -h --help     Show this screen.
  --version     Show version.

"""
from docopt import docopt
import re
from app import main

if __name__ == '__main__':
    arguments = docopt(__doc__, version='pecos 0.1')
    print arguments
    if arguments.get("<directory>"):
        active_dir = arguments.get("<directory>", ".")
        port = arguments.get("--port")
        if port and re.match("^[0-9]+$", port):
            main(active_dir, int(port))
        else:
            main(active_dir)
