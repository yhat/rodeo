# This script tests if python is setup properly. if not it exists with
# status code > 0
import sys
import json


status_jupyter = True
status_mpl = True

# check for IPython kernel
try:
    from jupyter_client import manager
except:
    try:
        from IPython.kernel import manager
    except:
        status_jupyter = False

sys.stdout.write(json.dumps({ "jupyter": status_jupyter, "matplotlib": status_mpl }))
