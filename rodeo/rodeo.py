from .kernel import Kernel
from .__init__ import __version__

from flask import Flask, request, render_template, jsonify
import markdown2
import logging
import pip
import webbrowser
import json
import os
import sys


app = Flask(__name__)
__dirname = os.path.dirname(os.path.abspath(__file__))
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
                result = kernel.get_dataframes()
            elif request.form.get('complete'):
                result = kernel.complete(code)
            else:
                result = kernel.execute(code)

            return jsonify(result)
        else:
            return "BAD"

@app.route("/about", methods=["GET"])
def about():
    return render_template("about.html", version=__version__)

@app.route("/file/<filename>", methods=["GET"])
def get_file(filename):
    logging.info("getting file: %s" % filename)
    filename = os.path.join(active_dir, filename)
    logging.info("expanded filepath: %s" % filename)
    if os.path.exists(filename):
        return open(filename).read()
    else:
        logging.info("file does not exist: %s" % filename)
        return "FILE DOES NOT EXIST: %s" % filename

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

@app.route("/md", methods=["POST"])
def markdownify():
    md = request.form.get("markdown")
    if md:
        html = markdown2.markdown(md)
        return html
    else:
        return "no markdown supplied"

@app.route("/upload", methods=["POST"])
def upload_data():
    if "data" in request.files:
        f = request.files['data']
        f.save(os.path.join(active_dir, f.filename))
        return "OK"
    else:
        return "No file specified"

def main(directory, port=5000, host=None, browser=True, verbose=False):
    global kernel
    global active_dir
    active_dir = os.path.realpath(directory)

    if not port:
        port = 5000

    if verbose==True:
        logging.basicConfig(format='[%(levelname)s]: %(message)s', level=logging.DEBUG)
    else:
        logging.basicConfig(format='[%(levelname)s]: %(message)s', level=logging.WARNING)


    kernel = Kernel(active_dir)
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

