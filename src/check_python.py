# This script tests if python is setup properly. if not it exists with
# status code > 0
import sys

try:
    from jupyter_client import BlockingKernelClient
except:
    try:
        from IPython.kernel import BlockingKernelClient
    except:
        sys.stdout.write("FAIL")
