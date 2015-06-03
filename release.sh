#!/bin/bash

pandoc -f markdown -t rst README.md > README.rst
python setup.py sdist $1

