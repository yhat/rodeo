import os
import sys
import json
import pprint as pp
import threading
from datetime import datetime
from collections import OrderedDict

# start compatibility with IPython Jupyter 4.0
try:
    from jupyter_client import manager
except ImportError:
    try:
        from IPython.kernel import manager
    except ImportError:
        raise Exception('Jupyter is not installed')

try:
    import pip
except:
    raise Exception('Pip is not installed')

try:
    import numpy
except:
    raise Exception('Numpy is not installed')

try:
    import pandas
except:
    raise Exception('Pandas is not installed')

try:
    import matplotlib
except:
    raise Exception('Matplotlib is not installed')

# python3/python2 nonsense
try:
    from Queue import Empty
    import Queue
except:
    from queue import Empty
    import queue as Queue

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
    current_timeout_min = 0.0005
    current_timeout_max = 0.01
    current_timeout = current_timeout_max

    acceptable_types = [
      "execute_input",
      "stream",
      "display_data",
      "error",
      "execute_result",
      "execute_reply",
      "complete_reply"
    ]

    input_queue = Queue.Queue()

    input_thread = threading.Thread(target=add_input, args=(input_queue,))
    input_thread.daemon = True
    input_thread.start()

    # we're up and running!
    sys.stdout.write(json.dumps({ "id": "startup-complete", "status": "complete" }) + "\n")

    should_continue = True
    while should_continue:
        if not input_queue.empty():
            current_timeout = current_timeout_min
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
                    if result:
                        sys.stdout.write(json.dumps({"source": "link", "result": result, "id": uid }) + '\n')
                else:
                    sys.stdout.write(json.dumps({ "error": "Missing method " + method, "id": uid }) + '\n')

            if exec_eval:
                result = eval(exec_eval)
                sys.stdout.write(json.dumps({ "source": "eval", "result": result, "id": uid }) + '\n')

        try:
            data = kernel_client.get_shell_msg(timeout=current_timeout)

            content = data.get('content', False)

            if content:
                payload = content.get('payload', False)
                if payload:
                    try:
                        first = payload[0]
                        if first:
                            source = first.get('source', False)
                            keepkernel = first.get('keepkernel', False)
                            if source == 'ask_exit' and keepkernel == False:
                                should_continue = False
                    except IndexError:
                        pass
                msg_type = data.get('msg_type', False)
                if msg_type == 'shutdown_reply':
                    shutdown_restart = content.get('restart', False)
                    if not shutdown_restart:
                        should_continue = False
            sys.stdout.write(json.dumps({"source": "shell", "result": data, "should_continue": should_continue}, default=json_serial) + '\n')
            current_timeout = current_timeout_min
        except Empty:
            pass

        try:
            while True:
                data = kernel_client.get_iopub_msg(timeout=current_timeout)
                sys.stdout.write(json.dumps({"source": "iopub", "result": data}, default=json_serial) + '\n')
                sys.stdout.flush()
                current_timeout = current_timeout_min
        except Empty:
            pass

        try:
            data = kernel_client.get_stdin_msg(timeout=current_timeout)
            sys.stdout.write(json.dumps({"source": "stdin", "result": data}, default=json_serial) + '\n')
            sys.stdout.flush()
            current_timeout = current_timeout_min
        except Empty:
            pass

        current_timeout = min(current_timeout * 1.1, current_timeout_max)

if __name__=="__main__":
    wd = None
    if len(sys.argv) > 1:
        wd = sys.argv[1]
    kernel(wd, verbose=2)
