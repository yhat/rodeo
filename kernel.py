import os
import sys
import time
from subprocess import Popen
import pprint as pp
from Queue import Empty
from IPython.kernel import BlockingKernelClient


class Kernel(object):
    def __init__(self):
        # TODO: fix this
        # should start kernel as subprocess that dies on app dying (?)
        cfpath = os.path.join('.', 'mykernel.json')
        self.client = BlockingKernelClient(connection_file=cfpath)
        self.client.load_connection_file()
        self.client.start_channels()

    def collect_outputs(self, timeout=0.1):
        """
        flush the IOPub channel for outputs, and construct a dict of output data 
        for each msg_id
        """
        all_outputs = {}
        while True:
            try:
                msg = self.client.get_iopub_msg(timeout=timeout)
            except Empty:
                break
            parent_id = msg['parent_header'].get('msg_id', None)
            
            # no parent, ignore
            if not parent_id:
                continue
            if parent_id not in all_outputs:
                all_outputs[parent_id] = dict(stdout='', stderr='', display_data=[])
            outputs = all_outputs[parent_id]

            header = msg['header']
            msg_type = header['msg_type']
            content = msg['content']

            if msg_type == 'stream':
                outputs[content['name']] += content['data']
            elif msg_type=='pyout':
                outputs['repr'] = content['data'].get('text/plain', '')
            elif msg_type=="pyerr":
                outputs['error'] = "\n".join(content['traceback'])
            elif msg_type in ('display_data'):
                outputs[msg_type].append(content)
        
        return all_outputs

    def execute(self, code):
        msg_id = self.client.execute(code)
        outputs = self.collect_outputs()
        print outputs
        return outputs.get(msg_id)

    def run_kernel(self):
        while True:
            code = sys.stdin.readline()
            msg_id = self.client.execute(code)
            outputs = self.collect_outputs()
            print outputs[msg_id]

