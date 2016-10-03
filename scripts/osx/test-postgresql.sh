#!/bin/bash

STARTING_DIR=$(pwd)
TARGET_DIR=~/Projects/yhat/rodeo/scripts/osx

cd $TARGET_DIR

docker-compose up

cd $STARTING_DIR
