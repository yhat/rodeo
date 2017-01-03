const _ = require('lodash'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname + '/' + filename, function () {
  let sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('does not throw when properties are equal', function () {
    const assertion = lib([{a: 'b'}, 'a should be b']);

    expect(function () {
      assertion({a: 'b'});
    }).to.not.throw();
  });

  it('does not throw when properties match', function () {
    const assertion = lib([{a: 'b'}, 'a should be b']);

    expect(function () {
      assertion({a: 'b', c: 'd'});
    }).to.not.throw();
  });

  it('throws when property values do not match', function () {
    const assertion = lib([{a: 'b'}, 'a should be b']);

    expect(function () {
      assertion({a: 'd', c: 'd'});
    }).to.throw('{"message":"a should be b","actual":{"a":"d","c":"d"},"assertion":{"a":"b"}}');
  });

  it('throws when property value is missing', function () {
    const assertion = lib([{a: 'b'}, 'a should be b']);

    expect(function () {
      assertion({c: 'd'});
    }).to.throw('{"message":"a should be b","actual":{"c":"d"},"assertion":{"a":"b"}}');
  });

  it('throws when second assertion fails (property value is missing)', function () {
    const assertion = lib(
      [{a: 'b'}, 'a should be b'],
      [{c: 'd'}, 'c should be d']
    );

    expect(function () {
      assertion({a: 'b'});
    }).to.throw('{"message":"c should be d","actual":{"a":"b"},"assertion":{"c":"d"}}');
  });

  it('does not throw when properties satisfy constraint', function () {
    const assertion = lib([{a: _.isString}, 'a should be string']);

    expect(function () {
      assertion({a: 'b'});
    }).to.not.throw();
  });

  it('throws when property does not satisfy constraint', function () {
    const assertion = lib([{a: _.isString}, 'a should be string']);

    expect(function () {
      assertion({a: 2});
    }).to.throw('{"message":"a should be string","actual":{"a":2},"assertion":{"a":"isString"}}');
  });

  it('does not throw when value matches type', function () {
    const assertion = lib(['string', 'must be string']);

    expect(function () {
      assertion('some string');
    }).to.not.throw();
  });

  it('throws when value does not match type', function () {
    const assertion = lib(['string', 'must be string']);

    expect(function () {
      assertion(2);
    }).to.throw('{"message":"must be string","actual":2,"assertion":"string"}');
  });

  it('does not throw when value satisfies constraint', function () {
    const assertion = lib([_.isString, 'must be string']);

    expect(function () {
      assertion('some string');
    }).to.not.throw();
  });

  it('throws when value does not satisfy constraint', function () {
    const assertion = lib([_.isString, 'must be string']);

    expect(function () {
      assertion(2);
    }).to.throw('{"message":"must be string","actual":2,"assertion":"isString"}');
  });
});
