# Gets information about a python instance, like packages installed and such
import sys
import json
import os
import pip

try:
    import pkg_resources
except:
    pkg_resources = None

def get_packages():
    if not pkg_resources:
        return []
    installed_packages = [d for d in pkg_resources.working_set]
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
        #if pip:
        #    try:
        #        pip.main(['install', '--disable-pip-version-check', '-qq', 'jupyter'])
        #    except:
        #        has_jupyter_kernel = False
        #else:
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
