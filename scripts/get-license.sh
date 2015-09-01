#!/bin/bash

for line in $(nlf --no-dev --csv)
do
  PKG=$(echo $line | awk -F, '{ print $1 }')
  LICENSE_FILE=$(echo $line | awk -F, '{ print $3"/LICENSE" }')
  LICENSE=$(cat ${LICENSE_FILE})
  echo "${PKG}\n${LICENSE}"
done
