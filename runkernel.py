import os
import sys
import time
from subprocess import Popen

from Queue import Empty
from IPython.kernel import BlockingKernelClient

cfpath = os.path.join('.', 'mykernel.json')
kernel = Popen([sys.executable, '-m', 'IPython', 'kernel', '-f', cfpath])