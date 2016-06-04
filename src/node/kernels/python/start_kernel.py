#!/usr/bin/env python

# start compatibility with IPython Jupyter 4.0
try:
    from jupyter_client import manager
except ImportError:
    from IPython.kernel import manager

# python3/python2 nonsense
try:
    from Queue import Empty
    import Queue
except:
    from queue import Empty
    import queue as Queue

from collections import OrderedDict

import os
import sys
import json
import pprint as pp
import threading
from datetime import datetime

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, datetime):
        serial = obj.isoformat()
        return serial
    raise TypeError ("Type not serializable")

def add_input(input_queue):
    while True:
        input_queue.put(sys.stdin.readline())

def kernel(wd=None, verbose=0):
    # setup ipython kernel and configure it
    kernel_manager, kernel_client = manager.start_new_kernel(extra_arguments=["--matplotlib='inline'"])

    acceptable_types = [
      "execute_input",
      "stream",
      "display_data",
      "error",
      "execute_result",
      "execute_reply",
      "complete_reply"
    ]

    # apply patches
    dirname = os.path.dirname(os.path.abspath(__file__))
    python_patch_file = os.path.join(dirname, "langs", "python-patch.py")
    kernel_client.execute("%run " + python_patch_file, {"silent":True, "store_history":False})

    # set working directory
    if wd:
        kernel_client.execute("cd %s" % wd)

    input_queue = Queue.Queue()

    input_thread = threading.Thread(target=add_input, args=(input_queue,))
    input_thread.daemon = True
    input_thread.start()

    # we're up and running!
    sys.stdout.write(json.dumps({ "id": "startup-complete", "status": "complete" }) + "\n")

    while True:
        if not input_queue.empty():
            line = input_queue.get().strip()
            payload = json.loads(line)
            uid = payload["id"]
            args = payload.get("args", [])
            kwargs = payload.get("kwargs", {})
            method = payload.get("method", False)
            target_str = payload.get("target", "client")
            exec_eval = payload.get("exec_eval", False)

            if target_str == "manager":
              target = kernel_manager
            else:
              target = kernel_client

            if method:
                if getattr(target, method, False):
                    result = getattr(target, method)(*args, **kwargs)
                    sys.stdout.write(json.dumps({"source": "link", "result": result, "id": uid }) + '\n')
                else:
                    sys.stdout.write(json.dumps({ "error": "Missing method " + method, "id": uid }) + '\n')

            if exec_eval:
                result = eval(exec_eval)
                sys.stdout.write(json.dumps({ "source": "eval", "result": result, "id": uid }) + '\n')

        try:
            while True:
                data = kernel_client.get_iopub_msg(timeout=0.0001)
                if data.get("msg_type") in acceptable_types:
                  sys.stdout.write(json.dumps({"source": "iopub", "result": data}, default=json_serial) + '\n')
                  sys.stdout.flush()
        except Empty:
            pass

        try:
            data = kernel_client.get_shell_msg(timeout=0.0001)
            sys.stdout.write(json.dumps({"source": "shell", "result": data}, default=json_serial) + '\n')
        except Empty:
            pass

        try:
            data = kernel_client.get_stdin_msg(timeout=0.0001)
            sys.stdout.write(json.dumps({"source": "stdin", "result": data}, default=json_serial) + '\n')
        except Empty:
            pass

if __name__=="__main__":
    wd = None
    if len(sys.argv) > 1:
        wd = sys.argv[1]
    kernel(wd, verbose=2)
