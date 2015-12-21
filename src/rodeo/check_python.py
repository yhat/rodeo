# This script tests if python is setup properly. if not it exists with
# status code > 0
import sys
import json


status_jupyter = True
status_mpl = True

# check for IPython kernel
try:
    from jupyter_client import BlockingKernelClient
except:
    try:
        from IPython.kernel import BlockingKernelClient
    except:
        status_jupyter = False

# check for matplotlib
try:
    import matplotlib
except:
    status_mpl = False

sys.stdout.write(json.dumps({ "jupyter": status_jupyter, "matplotlib": status_mpl }))
