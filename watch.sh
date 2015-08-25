#!/bin/bash

while [ 1 ]
do
    # Every half second attempt to recompile the static assets.
    # make will only trigger if something has changed.
    sleep '0.5'
    make | grep -v 'Nothing to be done for `all.'
done
