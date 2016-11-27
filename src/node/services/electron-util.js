/**
 * True if we've been packaged in an ASAR
 * @returns {boolean}
 */
function isAsar() {
  return __dirname.indexOf('app.asar') > -1;
}

module.exports.isAsar = isAsar;
