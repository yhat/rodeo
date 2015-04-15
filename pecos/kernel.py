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

            print(msg_type, content)
            # TODO: this isn't working properly
            if msg_type == 'stream':
                outputs[content['name']] += content.get('text')
            elif msg_type=='execute_result':
                outputs['repr'] = content['data'].get('text/plain', '')
            elif msg_type=="error":
                outputs['error'] = "\n".join(content['traceback'])
            elif msg_type in ('display_data'):
                outputs[msg_type].append(content)
        
        return all_outputs

    def execute(self, code):
        msg_id = self.client.execute(code)
        outputs = self.collect_outputs()
        return outputs.get(msg_id)

    def complete(self, code):
        msg_id = self.client.complete(code, len(code)-1)
        outputs = self.collect_outputs()
        return outputs.get(msg_id)

    def run_kernel(self):
        while True:
            code = sys.stdin.readline()
            msg_id = self.client.execute(code)
            outputs = self.collect_outputs()
            print(outputs[msg_id])

