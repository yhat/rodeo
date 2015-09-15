var fs = require('fs')
  , fse = require('fs-extra')
  , path = require('path')
  , spawn = require('child_process').spawn
  , uuid = require('uuid')
  , tmp = require('tmp')
  , colors = require('colors')
  , StreamSplitter = require("stream-splitter")
  , SteveIrwin = require(path.join(__dirname, '/../src/steve-irwin'));


global.completionCallbacks = {};

// we need to actually write the python kernel to a tmp file. this is so python
// can run as a "real" file and not an asar file
var pythonKernel = path.join(__dirname, "../src", "kernel.py");
var kernelFile = tmp.fileSync();
fse.copySync(pythonKernel, kernelFile.name);
fs.chmodSync(kernelFile.name, 0755);
var configFile = tmp.fileSync();
var delim = "\n";

module.exports = function(cb) {
  var python;
  SteveIrwin.findMeAPython(function(err, pythonCmd, opts) {
    if (pythonCmd==null || err) {
      cb("could not find a python", null);
    }

    python = spawn(pythonCmd, [kernelFile.name, configFile.name + ".json", delim], opts);

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
          delete completionCallbacks[result.id];
        } else {
          console.log("[ERROR]: " + "callback not found for: " + result.id + " --> " + JSON.stringify(result));
        }
      });
    python.execute = function(cmd, complete, fn) {
      var payload = { id: uuid.v4().toString(), code: cmd, complete: complete };
      completionCallbacks[payload.id] = function(result) {
        fn(result);
      }
      this.stdin.write(JSON.stringify(payload) + delim);    
    }
    cb(null, python);
  });
}
