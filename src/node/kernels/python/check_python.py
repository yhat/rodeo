# This script tests if python is setup properly. if not it exists with
# status code > 0
import sys
import json
import os

try:
    import pip
except:
    pip = None

def get_packages():
    if not pip:
        return []
    installed_packages = pip.get_installed_distributions()
    packages = [{ "name": i.key, "version": i.version} for i in installed_packages]
    installed_packages_list = sorted(packages, key=lambda x: x['name'])
    return installed_packages_list

# check for IPython kernel
has_jupyter_kernel = True
try:
    from jupyter_client import manager
except:
    try:
        from IPython.kernel import manager
    except:
        has_jupyter_kernel = False

# may fail
try:
  executable = sys.executable
except:
  executable = None

sys.stdout.write(json.dumps({
  "hasJupyterKernel": has_jupyter_kernel,
  "cwd": os.getcwd(),
  "version": sys.version,
  "executable": executable,
  "argv": sys.argv,
  "packages": get_packages()
}))
