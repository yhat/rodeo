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
import inspect
import types
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

def __get_variables(session):

    variables = {
        "list": [],
        "dict": [],
        "ndarray": [],
        "DataFrame": [],
        "Series": [],
        "function": [],
        "other": []
    }

    SPECIAL_VARS = ["In", "Out"]
    for variable_name in session.keys():

        if variable_name.startswith("_") or variable_name in SPECIAL_VARS:
            continue

        variable = session[variable_name]

        if variable_name in ["get_ipython", "exit", "quit"]:
            continue
        elif isinstance(variable, types.ModuleType):
            continue
        elif isinstance(variable, list):
            variable_repr = "List of length %d" % len(variable)
            variables["list"].append({ "name": variable_name, "repr": variable_repr })
        elif np and isinstance(variable, np.ndarray):
            shape = " x ".join([str(i) for i in variable.shape])
            variable_repr = "Array [%s]" %  shape
            variables["ndarray"].append({ "name": variable_name, "repr": variable_repr })
        elif isinstance(variable, dict):
            variable_repr = "Dict with %d keys" % len(variable)
            variables["dict"].append({ "name": variable_name, "repr": variable_repr })
        elif pd and isinstance(variable, pd.DataFrame):
            variable_repr = "DataFrame [%d rows x %d cols]" % variable.shape
            variables["DataFrame"].append({ "name": variable_name, "repr": variable_repr })
        elif pd and isinstance(variable, pd.Series):
            variable_repr = "Series [%d rows]" % variable.shape
            variables["Series"].append({ "name": variable_name, "repr": variable_repr })
        elif isinstance(variable, types.FunctionType):
            args = inspect.getargspec(variable)
            args = ", ".join(args.args)
            if len(args) > 40:
                args = args[:60] + "..."
            variable_repr = "def %s(%s)" % (variable_name, args)
            variables["function"].append({ "name": variable_name, "repr": variable_repr })
        else:
            variable_repr = str(type(variable))
            v = { "name": variable_name, "repr": variable_repr }
            variables["other"].append(v)

    for key in variables:
        variables[key] = sorted(variables[key], key=lambda x: "%s-%s" % (x['repr'], x['name']))

    print(json.dumps(variables))

def __get_packages():
    if not pip:
        print('[]')
        return
    installed_packages = pip.get_installed_distributions()
    packages = [{ "name": i.key, "version": i.version} for i in installed_packages]
    installed_packages_list = sorted(packages, key=lambda x: x['name'])
    print(json.dumps(installed_packages_list))
