'use strict';

const dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift();

describe(dirname + '::' + filename, function () {
  describe('getPreferences', function () {
    it('throws on missing USER_HOME', function () {

    });
  });
});