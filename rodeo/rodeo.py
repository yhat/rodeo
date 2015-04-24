from .kernel import Kernel
from .__init__ import __version__

from flask import Flask, request, url_for, render_template, jsonify, send_from_directory
import pip
import webbrowser
import tempfile
import json
import os
import sys


app = Flask(__name__)
__dirname = os.path.dirname(os.path.abspath(__file__))

# setup plotting directory
plot_dir = os.path.join(tempfile.gettempdir(), "rodeo-plots")
if not os.path.exists(plot_dir):
    os.mkdir(plot_dir)
else:
    # get rid of any pre-existing plots
    for f in os.listdir(plot_dir):
        if f.endswith(".png"):
            os.remove(os.path.join(plot_dir, f))

active_dir = "."
kernel = None

@app.route("/", methods=["GET", "POST"])
def home():
    if request.method=="GET":
        packages = pip.get_installed_distributions()
        packages = sorted(packages, key=lambda k: k.key)
        files = [f for f in os.listdir(active_dir) if f.endswith(".py")]
        return render_template("index.html", packages=packages, files=files,
                version=__version__)
    else:
        code = request.form.get('code')
        if code:
            if code=="getvars":
                code = "__get_variables()"
            if request.form.get('complete'):
                result = kernel.complete(code)
            else:
                result = kernel.execute(code)

            return jsonify(result)
        else:
            return "BAD"

@app.route("/about", methods=["GET"])
def about():
    return render_template("about.html", version=__version__)

@app.route("/plots", methods=["GET"])
def plots():
    plots = []
    for plot in os.listdir(plot_dir):
        if plot.endswith(".png"):
            plots.append(url_for("serve_plot", filename=plot))
    return jsonify({ "plots": plots })

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

@app.route("/rc", methods=["GET", "POST"])
def rc():
    home = os.path.expanduser("~")
    filename = os.path.join(home, ".rodeorc")
    # give it the good ole college try
    try:
        rc = json.load(open(filename, 'rb'))
    except:
        rc = {}

    if request.method=="GET":
        return jsonify({ "status": "OK", "rc": rc })
    else:
        for field, value in request.form.items():
            rc[field] = value
        with open(filename, "wb") as f:
            f.write(json.dumps(rc))
        return "OK"

@app.route("/plots/<filename>")
def serve_plot(filename):
    return send_from_directory(plot_dir, filename)

def main(directory, port=5000, host=None, browser=True):
    global kernel
    global active_dir
    active_dir = os.path.realpath(directory)

    if not port:
        port = 5000

    kernel = Kernel(plot_dir)
    art = open(os.path.join(__dirname, "rodeo-ascii.txt"), 'r').read()
    display = """
{ART}
''''''''''''''''''''''''''''''''''''''''''''''''''
  URL: http://localhost:{PORT}/
  DIRECTORY: {DIR}
''''''''''''''''''''''''''''''''''''''''''''''''''
""".format(ART=art, PORT=port, DIR=active_dir)
    sys.stderr.write(display)
    if browser:
        webbrowser.open("http://localhost:%d/" % port, new=2)
    app.run(debug=False, host=host, port=port)

if __name__=="__main__":
    if len(sys.argv)==1:
        directory = "."
    else:
        directory = sys.argv[1]
    main(directory)

