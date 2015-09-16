import sys
import re
import urlparse
import csv
import pprint as pp

s3_line_logpats  = r'(\S+) (\S+) \[(.*?)\] (\S+) (\S+) ' \
           r'(\S+) (\S+) (\S+) "([^"]+)" ' \
           r'(\S+) (\S+) (\S+) (\S+) (\S+) (\S+) ' \
           r'"([^"]+)" "([^"]+)"'

s3_line_logpat = re.compile(s3_line_logpats)

(S3_LOG_BUCKET_OWNER, S3_LOG_BUCKET, S3_LOG_DATETIME, S3_LOG_IP,
S3_LOG_REQUESTOR_ID, S3_LOG_REQUEST_ID, S3_LOG_OPERATION, S3_LOG_KEY,
S3_LOG_HTTP_METHOD_URI_PROTO, S3_LOG_HTTP_STATUS, S3_LOG_S3_ERROR,
S3_LOG_BYTES_SENT, S3_LOG_OBJECT_SIZE, S3_LOG_TOTAL_TIME,
S3_LOG_TURN_AROUND_TIME, S3_LOG_REFERER, S3_LOG_USER_AGENT) = range(17)

s3_names = ("bucket_owner", "bucket", "datetime", "ip", "requestor_id", 
"request_id", "operation", "key", "http_method_uri_proto", "http_status", 
"s3_error", "bytes_sent", "object_size", "total_time", "turn_around_time",
"referer", "user_agent")

parameter_names = ("cid", "ec", "ea", "an", "av", "sr")

def parse_s3_log_line(line):
    match = s3_line_logpat.match(line)
    result = [match.group(1+n) for n in range(17)]
    result = dict(zip(s3_names, result))
    url = result['http_method_uri_proto'].split()[1]
    u = urlparse.urlparse(url)
    result['parameters'] = urlparse.parse_qs(u.query)
    return result


def flatten_line(line):
    row = []
    for key in s3_names:
        row.append(line.get(key))
    for key in parameter_names:
        row.append(line.get('parameters', {}).get(key))
    return row

if __name__=="__main__":
    columns = s3_names + parameter_names
    f = csv.writer(sys.stdout)
    # f.writerow(columns)
    for line in sys.stdin:
        line = parse_s3_log_line(line)
        line = flatten_line(line)
        f.writerow(line)
