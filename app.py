from kernel import Kernel
from flask import Flask, request, session, g, redirect, url_for, abort, render_template, jsonify
import sys
import os


app = Flask(__name__)
__dirname = os.path.dirname(os.path.abspath(__file__))


@app.route("/", methods=["GET", "POST"])
def home():
    if request.method=="GET":
        packages = []
        files = os.listdir(active_dir)
        return render_template("index.html", packages=packages, files=files)
    else:
        code = request.form.get('code')
        if code:
            if code=="getvars":
                kernel.execute("import json")
                code = 'print json.dumps([{ "name": v, "dtype": type(vars()[v]).__name__ } for v in list(set(vars()))])'
            result = kernel.execute(code)
            result['output'] = result.get("stdout")
            if not result['output']:
                result['output'] = result.get("repr", '')
            return jsonify(result)
        else:
            return "BAD"

@app.route("/plots", methods=["GET"])
def plots():
    files = os.listdir(os.path.join(__dirname, "static", "plots"))
    files = ["/plots/%s" % f for f in files if f.endswith(".png")]
    return jsonify({ "plots": files })

@app.route("/file/<filename>", methods=["GET"])
def get_file(filename):
    filename = os.path.join(active_dir, filename)
    return open(filename).read()

@app.route("/file", methods=["POST"])
def save_file():
    filename = os.path.join(active_dir, request.form['filename'])
    with open(filename, 'wb') as f:
        f.write(request.form['source'])
    return "OK"


if __name__=="__main__":
    active_dir = "files"
    kernel = Kernel()
    app.run(debug=False, port=5000)
