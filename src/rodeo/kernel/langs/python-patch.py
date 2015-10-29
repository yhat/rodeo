import pprint as pp
import json
try:
    import pandas as pd
except:
    pd = None

try:
    import numpy as np
except:
    np = None

try:
    import pip
except:
    pip = None

import ast
import re

def __is_code_finished(code):
    try:
        ast.parse(code)
        if "\\n" in code:
            return re.search('\\n\s+?$', code) is not None
        else:
            return True
    except Exception as e:
        return str(e)

def __get_variables():

    variables = {
        "list": [],
        "dict": [],
        "ndarray": [],
        "DataFrame": [],
        "Series": []
    }

    SPECIAL_VARS = ["In", "Out"]
    for variable_name in globals().keys():

        if variable_name.startswith("_") or variable_name in SPECIAL_VARS:
            continue

        variable = globals()[variable_name]

        if isinstance(variable, list):
            variable_repr = "List of length %d" % len(variable)
            variables["list"].append({ "name": variable_name, "repr": variable_repr })
        if np and isinstance(variable, np.ndarray):
            shape = " x ".join([str(i) for i in variable.shape])
            variable_repr = "Array [%s]" %  shape
            variables["ndarray"].append({ "name": variable_name, "repr": variable_repr })
        if isinstance(variable, dict):
            variable_repr = "Dict with %d keys" % len(variable)
            variables["dict"].append({ "name": variable_name, "repr": variable_repr })
        if pd and isinstance(variable, pd.DataFrame):
            variable_repr = "[%d rows x %d cols]" % variable.shape
            variables["DataFrame"].append({ "name": variable_name, "repr": variable_repr })
        if pd and isinstance(variable, pd.Series):
            variable_repr = "[%d rows]" % variable.shape
            variables["Series"].append({ "name": variable_name, "repr": variable_repr })

    print(json.dumps(variables))

def __get_packages():
    if not pip:
        print('[]')
        return
    installed_packages = pip.get_installed_distributions()
    packages = [{ "name": i.key, "version": i.version} for i in installed_packages]
    installed_packages_list = sorted(packages, key=lambda x: x['name'])
    print(json.dumps(installed_packages_list))
