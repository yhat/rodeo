from IPython.kernel import BlockingKernelClient
from Queue import Empty
import atexit
import subprocess
import uuid
import time
import os
import sys

__dirname = os.path.dirname(os.path.abspath(__file__))

matplotlib_patch = """
# monkey patching matplotlib
import time
import uuid
import matplotlib
import matplotlib.pyplot as plt
matplotlib.use('Agg')


def hijack_plots():
    fname = "{__dirname}/static/plots/%d-%s.png" % (int(time.time()), str(uuid.uuid4()))
    plt.savefig(fname)

plt.show = hijack_plots
""".format(__dirname=__dirname)

autocomplete_patch = """
import jedi

def __autocomplete(code):
    script = jedi.Interpreter(code, [globals()])
    print json.dumps([cmp.name for cmp in script.completions()])
"""

vars_patch = """
import json

def __get_variables():
    user_variables = globals().keys()
    results = [{"name": v, "dtype": type(globals()[v]).__name__} for v in user_variables]
    print json.dumps(results)

"""

class Kernel(object):
    def __init__(self):
        # should start kernel as subprocess that dies on app dying
        __dirname = os.path.dirname(os.path.abspath(__file__))
        config = os.path.join(__dirname, "kernel-%s.json" % str(uuid.uuid4()))
        args = [sys.executable, '-m', 'IPython', 'kernel', '-f', config]
        p = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        atexit.register(p.terminate)
        def remove_config():
            os.remove(config)
        atexit.register(remove_config)

        time.sleep(1.5)
        self.client = BlockingKernelClient(connection_file=config)
        self.client.load_connection_file()
        self.client.start_channels()
        self.client.execute(matplotlib_patch)
        self.client.execute(autocomplete_patch)
        self.client.execute(vars_patch)

    def _run_code(self, code, timeout=0.1):
        # now we can run code.  This is done on the shell channel
        # execution is immediate and async, returning a UUID
        msg_id = self.client.execute(code)
        data = None
        while True:
            try:
                reply = self.client.get_iopub_msg(timeout=timeout)
            except Empty:
                continue

            if "execution_state" in reply['content']:
                if reply['content']['execution_state']=="idle" and reply['parent_header']['msg_id']==msg_id:
                    if reply['parent_header']['msg_type']=="execute_request":
                        return { "output": data, "msg_id": msg_id }
            elif reply['header']['msg_type']=="execute_result":
                data = reply['content']['data']['text/plain']
            elif reply['header']['msg_type']=="stream":
                data = reply['content']['text']
            elif reply['header']['msg_type']=="error":
                data = "\n".join(reply['content']['traceback'])

    def execute(self, code):
        return self._run_code(code)

    def complete(self, code):
        return self.execute("__autocomplete('%s')" % code)

    def run_kernel(self):
        while True:
            code = sys.stdin.readline()
            msg_id = self.client.execute(code)
            outputs = self.collect_outputs()
            print(outputs[msg_id])

