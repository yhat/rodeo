# start compatibility with IPython Jupyter 4.0+
try:
    from jupyter_client import BlockingKernelClient
except ImportError:
    from IPython.kernel import BlockingKernelClient

# python3/python2 nonsense
try:
    from Queue import Empty
except:
    from queue import Empty

import atexit
import subprocess
import uuid
import time
import os
import sys

__dirname = os.path.dirname(os.path.abspath(__file__))


# explanation of this in `complete` function
autocomplete_patch = """
import jedi

def __autocomplete(code):
    script = jedi.Interpreter(code, [globals()])
    results = []
    for completion in script.completions():
        result = {
            "text": completion.name,
            "dtype": "---"
        }
        if code.endswith("."):
            result["dtype"] = "function"
        else:
            result["dtype"] = "session variable" # type(globals().get(code)).__name__
        results.append(result)
    print(json.dumps(results))
"""

vars_patch = """
import json
try:
    import pandas as pd
except:
    pd = None

def __get_variables():
    if not pd:
        print('[]')
    variable_names = globals().keys()
    data_frames = []
    for v in variable_names:
        if v.startswith("_"):
            continue
        if isinstance(globals()[v], pd.DataFrame):
            data_frames.append({
                "name": v,
                "dtype": "DataFrame"
            })
    print(json.dumps(data_frames))

"""

class Kernel(object):
    def __init__(self, active_dir):
        # kernel config is stored in a dot file with the active directory
        config = os.path.join(active_dir, ".kernel-%s.json" % str(uuid.uuid4()))
        # right now we're spawning a child process for IPython. we can 
        # probably work directly with the IPython kernel API, but the docs
        # don't really explain how to do it.
        args = [sys.executable, '-m', 'IPython', 'kernel', '-f', config]
        p = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # when __this__ process exits, we're going to remove the ipython config
        # file and kill the ipython subprocess
        atexit.register(p.terminate)

        def remove_config():
            os.remove(config)
        atexit.register(remove_config)

        # i found that if i tried to connect to the kernel immediately, it wasn't
        # up and running. 1.5 seconds was arbitrarily chosen (but seems to work)
        time.sleep(1.5)
        # fire up the kernel with the appropriate config
        self.client = BlockingKernelClient(connection_file=config)
        self.client.load_connection_file()
        self.client.start_channels()
        # load our monkeypatches...
        self.client.execute("%matplotlib inline")
        self.client.execute(autocomplete_patch)
        self.client.execute(vars_patch)

    def _run_code(self, code, timeout=0.1):
        # this function executes some code and waits for it to completely finish 
        # before returning. i don't think that this is neccessarily the best 
        # way to do this, but the IPython documentation isn't very helpful for 
        # this particular topic.
        # 
        # 1) execute code and grab the ID for that execution thread
        # 2) look for messages coming from the "iopub" channel (this is just a 
        #    stream of output)
        # 3) when we get a message that is one of the following, save relevant 
        # data to `data`:
        #       - execute_result - content from repr
        #       - stream - content from stdout
        #       - error - ansii encoded stacktrace
        # the final piece is that we check for when the message indicates that 
        # the kernel is idle and the message's parent is the original execution 
        # ID (msg_id) that's associated with our executing code. if this is the 
        # case, we'll return the data and the msg_id and exit
        msg_id = self.client.execute(code)
        output = { "msg_id": msg_id, "output": None, "image": None, "error": None }
        while True:
            try:
                reply = self.client.get_iopub_msg(timeout=timeout)
            except Empty:
                continue

            if "execution_state" in reply['content']:
                if reply['content']['execution_state']=="idle" and reply['parent_header']['msg_id']==msg_id:
                    if reply['parent_header']['msg_type']=="execute_request":
                        return output
            elif reply['header']['msg_type']=="execute_result":
                output['output'] = reply['content']['data'].get('text/plain', '')
            elif reply['header']['msg_type']=="display_data":
                output['image'] = reply['content']['data'].get('image/png', '')
            elif reply['header']['msg_type']=="stream":
                output['output'] = reply['content'].get('text', '')
            elif reply['header']['msg_type']=="error":
                output['error'] = "\n".join(reply['content']['traceback'])

    def execute(self, code):
        return self._run_code(code)

    def complete(self, code):
        # i couldn't figure out how to get the autocomplete working with the 
        # ipython kernel (i couldn't get a completion_reply from the iopub), so 
        # we're using jedi to do the autocompletion. the __autocomplete is 
        # defined in `autocomplete_patch` above.
        return self.execute("__autocomplete('%s')" % code)
    
    def get_dataframes(self):
        return self.execute("__get_variables()")

