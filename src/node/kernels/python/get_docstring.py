def __get_docstrings(session, names, is_function):
    if is_function==True:
        dtype = "function"
    else:
        dtype = "---"

    docstrings = []
    for name in names:
        try:
            if name in session:
                docstring = session[name].__doc__
            else:
                docstring = eval(name, session).__doc__
        except:
            docstring = "no docstring provided"

        docstrings.append({
            "text": name,
            "dtype": dtype,
            "docstring": docstring,
        })
    print(json.dumps(docstrings))
