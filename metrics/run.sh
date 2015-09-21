#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd ${DIR}

test -f output.csv && rm output.csv
./fetch-metrics.sh > output.csv
./load.sh

cd --
