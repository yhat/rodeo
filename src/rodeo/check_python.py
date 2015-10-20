# This script tests if python is setup properly. if not it exists with
# status code > 0
import sys

# check for IPython kernel
try:
    from jupyter_client import BlockingKernelClient
except:
    try:
        from IPython.kernel import BlockingKernelClient
    except:
        sys.stdout.write("FAIL-jupyter")

# check for matplotlib
try:
    import matplotlib
except:
    sys.stdout.write("FAIL-matplotlib")
