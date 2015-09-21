#!/bin/bash

if [ "$1" == "--all" ]; then
  PAT=""
else
  PAT=$(python -c 'from datetime import timedelta, datetime; print(datetime.utcnow() - timedelta(hours=1)).strftime("%Y-%m-%d-%H")')
fi

test -f /tmp/s3cmd.file && rm /tmp/s3cmd.file
echo ${PAT} 1>&2

echo "bucket_owner,bucket,datetime,ip,requestor_id,request_id,operation,key,http_method_uri_proto,http_status,s3_error,bytes_sent,object_size,total_time,turn_around_time,referer,user_agent,cid,ec,ea,an,av,sr"
for f in $(s3cmd ls "s3://rodeo-analytics/logs/${PAT}" | awk '{ print $NF }')
do
  echo "    reading file: ${f}" 1>&2
  s3cmd get $f /tmp/s3cmd.file > /dev/null
  # index and error are the only 2 keys in the bucket
  cat /tmp/s3cmd.file | grep -E "index.html|error.html" | python ./metrics/parse_s3_logs.py
  rm /tmp/s3cmd.file
done
