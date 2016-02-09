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

def add_input(input_queue):
    while True:
        input_queue.put(sys.stdin.readline())

def kernel(wd=None, verbose=0):
    # setup ipython kernel and configure it
    kernel_mgr, kernel_client = manager.start_new_kernel(extra_arguments=["--matplotlib='inline'"])

    # apply patches
    dirname = os.path.dirname(os.path.abspath(__file__))
    python_patch_file = os.path.join(dirname, "langs", "python-patch.py")
    kernel_client.execute("%run " + python_patch_file)

    # set working directory
    if wd:
        kernel_client.execute("cd %s" % wd)

    input_queue = Queue.Queue()

    input_thread = threading.Thread(target=add_input, args=(input_queue,))
    input_thread.daemon = True
    input_thread.start()

    outputs = {}
    docstring_callbacks = {}
    try:
        os.write(3, '{"status" : "OK"}' + "\n")
    except:
        os.write(3, bytes('{"status" : "OK"}' + "\n", 'utf-8'))

    while True:
        if not input_queue.empty():
            line = input_queue.get().strip()
            payload = json.loads(line)

            execution_id = payload['id']
            code = payload['code']
            complete = payload.get('complete', False)
            if verbose > 0:
                sys.stderr.write(line + '\n')
            if complete==True:
                msg_id = kernel_client.complete(code)
            elif complete=='input':
                msg_id = kernel_client.stdin_channel.execute(code)
            else:
                msg_id = kernel_client.execute(code, allow_stdin=False)

            if code=="interrupt_kernel":
                sys.stderr.write("interrupting kernel\n")
                sys.stderr.flush()
                kernel_mgr.interrupt_kernel()
                reply = {
                    "id": execution_id,
                    "msg_id": msg_id,
                    "output": "",
                    "status": "complete",
                    "stream": None,
                    "image": None,
                    "error": None
                }
                sys.stdout.write(json.dumps(reply) + '\n')
                sys.stdout.flush()
                continue

            outputs[msg_id] = {
                "id": execution_id,
                "msg_id": msg_id,
                "output": "",
                "stream": None,
                "image": None,
                "error": None
            }
            sys.stdout.write(json.dumps({ "msg_id": msg_id, "id": execution_id, "code": code }) + '\n')
            sys.stdout.flush()

        data = None
        try:
            data = kernel_client.get_iopub_msg(timeout=0.1)
        except Empty:
            try:
                data = kernel_client.get_shell_msg(timeout=0.1)
            except:
                try:
                    data = kernel_client.get_stdin_msg(timeout=0.1)
                except:
                    continue

        parent_msg_id = data['parent_header']['msg_id']
        if parent_msg_id not in outputs and parent_msg_id not in docstring_callbacks:
            continue

        if verbose > 0:
            pp.pprint(data, sys.stderr)

        # handle code execution results
        if parent_msg_id in docstring_callbacks:
            if data['header']['msg_type']=="stream":
                docstring = data['content']['text']
                original_parent_msg_id = docstring_callbacks[parent_msg_id]['parent_msg_id']
                outputs[original_parent_msg_id]['output2'][parent_msg_id]['docstring'] = docstring
                outputs[original_parent_msg_id]['n_finished_docstrings'] += 1

                del docstring_callbacks[parent_msg_id]

                if outputs[original_parent_msg_id]['n_finished_docstrings']==len(outputs[original_parent_msg_id]['output2']):
                    outputs[original_parent_msg_id]['output'] = outputs[original_parent_msg_id]['output2'].values()
                    sys.stdout.write(json.dumps(outputs[original_parent_msg_id]) + '\n')
                    sys.stdout.flush()
                    del outputs[original_parent_msg_id]
                continue
                # if this is the last one that needs a docstring, then send back everything
            else:
                continue
        elif 'execution_state' in data['content']:
            if data['content']['execution_state']=='idle':
                if data['parent_header']['msg_type']=='execute_request':
                    outputs[parent_msg_id]['status'] = 'complete'
                    outputs[parent_msg_id]['stream'] = None
                    outputs[parent_msg_id]['image'] = None
                    outputs[parent_msg_id]['error'] = None
                    sys.stdout.write(json.dumps(outputs[parent_msg_id]) + '\n')
                    sys.stdout.flush()
                    del outputs[parent_msg_id]
                    continue
        elif data['header']['msg_type']=="execute_result":
            outputs[parent_msg_id]['output'] = data['content']['data'].get('text/plain', '')
            outputs[parent_msg_id]['stream'] = data['content']['data'].get('text/plain', '')
        elif data['header']['msg_type']=="display_data":
            if 'image/png' in data['content']['data']:
                outputs[parent_msg_id]['image'] = data['content']['data']['image/png']
            elif 'text/html' in data['content']['data']:
                outputs[parent_msg_id]['html'] = data['content']['data']['text/html']
        elif data['header']['msg_type']=="stream":
            outputs[parent_msg_id]['output'] += data['content'].get('text', '')
            outputs[parent_msg_id]['stream'] = data['content'].get('text', '')
        elif data['header']['msg_type']=="error":
            outputs[parent_msg_id]['error'] = "\n".join(data['content']['traceback'])
        elif data['header']['msg_type']=="input_request":
            outputs[parent_msg_id]['status'] = 'input'
            outputs[parent_msg_id]['stream'] = data['content'].get('prompt', '')

        sys.stdout.write(json.dumps(outputs[parent_msg_id]) + '\n')
        sys.stdout.flush()
        # TODO: figure out why this is here...
        outputs[parent_msg_id]['image'] = None
        outputs[parent_msg_id]['stream'] = None

        # handle autocomplete matches
        if 'matches' in data['content'] and data['msg_type']=='complete_reply' and data['parent_header']['msg_id']==msg_id:
            results = []
            results2 = OrderedDict()
            for completion in data['content']['matches']:
                result = {
                    'value': completion,
                    'dtype': '---'
                }
                text = result['value']
                dtype = ''
                dtype = None
                if '.' in code:
                    dtype = 'function'

                # get docstring metadata for each suggestion
                msg_id = kernel_client.execute('print(%s.__doc__)' % completion)
                results2[msg_id] = {
                    'text': text,
                    'dtype': result['dtype'],
                    'docstring': None
                }
                docstring_callbacks[msg_id] = { 'parent_msg_id': parent_msg_id, 'docstring': None}
                results.append(result)

            func_args = "[%s]" % ", ".join([completion for completion in data['content']['matches']])
            msg_id = kernel_client.execute('%s.__doc__)' % completion)
            msg_id = kernel_client.execute("__get_metadata(%s)" % func_args)
            docstring_callbacks[msg_id] = None

            outputs[parent_msg_id]['output'] = results
            outputs[parent_msg_id]['output2'] = results2
            outputs[parent_msg_id]['n_finished_docstrings'] = 0
            outputs[parent_msg_id]['status'] = 'complete'

if __name__=="__main__":
    wd = None
    if len(sys.argv) > 1:
        wd = sys.argv[1]
    kernel(wd, verbose=0)
