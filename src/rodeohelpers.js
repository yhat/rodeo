var fs = require('fs');
var path = require('path');

global.USER_HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var rodeorc = path.join(USER_HOME, ".rodeorc");

function updateRC(key, value) {
  var rc;
  if (fs.existsSync(rodeorc)) {
    rc = JSON.parse(fs.readFileSync(rodeorc).toString());
  } else {
    rc = {};
  }
  rc[key] = value;
  fs.writeFileSync(rodeorc, JSON.stringify(rc, null, 2));
}

function getRC() {
  var rodeorc = path.join(USER_HOME, ".rodeorc");
  var rc;
  if (fs.existsSync(rodeorc)) {
    rc = JSON.parse(fs.readFileSync(rodeorc).toString())
  } else {
    rc = {};
  }
  return rc;
}

function formatFilename(filename) {
  // strange windows issue w/ javascript
  if (path.sep=="\\") {
    return filename.replace(/\\/g, '\\\\');
  } else {
    return filename;
  }
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function longestCommonSubstring(str1, str2){
	if (!str1 || !str2)
		return {
			length: 0,
			sequence: "",
			offset: 0
		};

	var sequence = "",
		str1Length = str1.length,
		str2Length = str2.length,
		num = new Array(str1Length),
		maxlen = 0,
		lastSubsBegin = 0;

	for (var i = 0; i < str1Length; i++) {
		var subArray = new Array(str2Length);
		for (var j = 0; j < str2Length; j++)
			subArray[j] = 0;
		num[i] = subArray;
	}
	var thisSubsBegin = null;
	for (var i = 0; i < str1Length; i++) {
		for (var j = 0; j < str2Length; j++) {
			if (str1[i] !== str2[j]) {
				num[i][j] = 0;
			} else {
				if ((i === 0) || (j === 0)) {
					num[i][j] = 1;
				} else {
					num[i][j] = 1 + num[i - 1][j - 1];
        }
				if (num[i][j] > maxlen) {
					maxlen = num[i][j];
					thisSubsBegin = i - num[i][j] + 1;
					if (lastSubsBegin === thisSubsBegin) {
            //if the current LCS is the same as the last time this block ran
						sequence += str1[i];
					} else {
            //this block resets the string builder if a different LCS is found
						lastSubsBegin = thisSubsBegin;
						sequence= ""; //clear it
						sequence += str1.substr(lastSubsBegin, (i + 1) - lastSubsBegin);
					}
				}
			}
		}
	}
	return {
		length: maxlen,
		sequence: sequence,
		offset: thisSubsBegin
	};
}

module.exports.getRC = getRC;
module.exports.updateRC = updateRC;
module.exports.formatFilename = formatFilename;
module.exports.escapeRegExp = escapeRegExp;
module.exports.longestCommonSubstring = longestCommonSubstring;
