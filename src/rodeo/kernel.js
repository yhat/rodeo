var fs = require('fs')
  , fse = require('fs-extra')
  , path = require('path')
  , spawn = require('child_process').spawn
  , uuid = require('uuid')
  , tmp = require('tmp')
  , colors = require('colors')
  , StreamSplitter = require('stream-splitter')
  , SteveIrwin = require('./steve-irwin');


global.completionCallbacks = {};

// we need to actually write the python kernel to a tmp file. this is so python
// can run as a "real" file and not an asar file
var pythonKernel = path.join(__dirname, "kernel.py");
var kernelFile = tmp.fileSync();
fse.copySync(pythonKernel, kernelFile.name);
fs.chmodSync(kernelFile.name, 0755);
var configFile = tmp.fileSync();
var delim = "\n";

module.exports = function(cb) {
  var python;
  SteveIrwin.findMeAPython(function(err, pythonCmd, opts) {
    if (pythonCmd==null || err) {
      cb(err, null);
    }

    console.log("[INFO]: starting python using PYTHON='" + pythonCmd + "'");
    console.log("[INFO]: starting python using OPTIONS='" + JSON.stringify(opts) + "'");
    var args = [ kernelFile.name, configFile.name + ".json", delim ];
    python = spawn(pythonCmd, args, opts);

    // we'll print any feedback from the kernel as yellow text
    python.stderr.on("data", function(data) {
    // process.stderr.write(data.toString().yellow);
      console.log(data.toString().yellow);
    });

    python.on("error", function(err) {
      console.log(err.toString());
    });

    python.on("exit", function(code) {
      fs.unlink(kernelFile.name, function(err) {
        if (err) {
          console.log("failed to remove temporary kernel file: " + err);
        }
        // show crash modal
        // TODO: add crash modal w/ restart option
      });
      console.log("exited with code: " + code);
    });

    python.on("close", function(code) {
      console.log("closed with code: " + code);
    });

    python.on("disconnect", function() {
      console.log("disconnected");
    });

    // StreamSplitter looks at the incoming stream from kernel.py (which is line
    // delimited JSON) and splits on \n automatically, so we're just left with the
    // JSON data
    python.stdout.pipe(StreamSplitter(delim))
      .on("token", function(data) {
        var result = JSON.parse(data.toString());
        if (result.id in completionCallbacks) {
          completionCallbacks[result.id](result);
          if (result.status=="complete") {
            delete completionCallbacks[result.id];
          }
        } else {
          console.log("[ERROR]: " + "callback not found for: " + result.id + " --> " + JSON.stringify(result));
        }
      });
    python.execute = function(cmd, complete, fn) {
      var payload = { id: uuid.v4().toString(), code: cmd, complete: complete };
      var results = [];
      var output = "";
      completionCallbacks[payload.id] = function(result) {
        // autocompleted results come back as a proper JSON array
        if (complete==true) {
          output = result.output;
        } else {
          output = output + (result.output || "");
        }
        if (result.status=="complete") {
          var r = results[results.length-1];
          r.output = output;
          fn(r);
        }
        results.push(result)
      }
      this.stdin.write(JSON.stringify(payload) + delim);
    };

    python.executeStream = function(cmd, complete, fn) {
      var payload = { id: uuid.v4().toString(), code: cmd, complete: complete };
      completionCallbacks[payload.id] = fn
      this.stdin.write(JSON.stringify(payload) + delim);
    };

    cb(null, python);
  });
}
