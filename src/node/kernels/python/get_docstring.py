import sys


matches = sys.argv[1].split(",")

for completion in matches:
    names.append("'" + completion + "'")

names = "[%s]" % ", ".join(names)
cmd = '__get_docstrings(globals(), %s, %r)' % (names, "." in code)
msg_id = kernel_client.execute(cmd)

