import pprint as pp
import os
import json
import ast
import inspect
import types
import re
import pandas as pd
import numpy as np
import pip

def __rodeo_print_status(session):
   print(json.dumps({
     "variables": __rodeo_get_variables(session),
     "cwd": os.getcwd()
   }))

def __rodeo_get_variables(session):

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
            v = { "name": variable_name, "repr": variable_repr, "value": str(variable)}
            variables["other"].append(v)

    for key in variables:
        variables[key] = sorted(variables[key], key=lambda x: "%s-%s" % (x['repr'], x['name']))

    return variables
