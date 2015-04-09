import sys
import json
import StringIO
import time
import uuid

# monkey patching matplotlib
import matplotlib
import matplotlib.pyplot as plt
matplotlib.use('Agg')


def hijack_plots():
    fname = "public/plots/%d-%s.png" % (int(time.time()), str(uuid.uuid4()))
    plt.savefig(fname)

plt.show = hijack_plots

variables = set(vars())
variables.add("codeOut")
variables.add("code")
variables.add("variables")
variables.add("mode")
variables.add("line")
variables.add("data")
variables.add("v")
variables.add("out")
variables.add("myvars")
variables.add("e")
variables.add("delim")

if __name__=="__main__":
    delim = sys.argv[1]
    mode = "ipython"
    line = sys.stdin.readline()
    while line:
        # explicitly write to stdout
        sys.stdout.write(line)
        sys.stdout.flush()
        # handle incoming data, parse it, and redirect
        # stdout so it doesn't interfere
        line = sys.stdin.readline()
        data = json.loads(line)
        codeOut = StringIO.StringIO()
        sys.stdout = codeOut
        try:
            code = data["code"]
            if code=="getvars":
                myvars = list(set(vars()) - variables)
                out = [{ "name": v, "dtype": type(vars()[v]).__name__ } for v in sorted(myvars) ]
                print json.dumps(out)
            elif data.get("autocomplete")==True:
                _, completions = shell.complete(code)
                print json.dumps(completions)
            elif code.startswith("print"):
                exec(code)
                # doesn't work w/ print; needs print()
                # shell.ex(code)
            else:
                try:
                    print repr(eval(code))
                    # print repr(shell.ev(code))
                except:
                    exec(code)
                    # shell.ex(code)
        except Exception, e:
            pass

        sys.stdout = sys.__stdout__
        data["output"] = codeOut.getvalue().strip()
        sys.stdout.write(json.dumps(data) + delim)
        sys.stdout.flush()
