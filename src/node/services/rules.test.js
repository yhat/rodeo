'use strict';

const _ = require('lodash'),
  expect = require('chai').expect,
  dirname = __dirname.split('/').pop(),
  filename = __filename.split('/').pop().split('.').shift(),
  lib = require('./' + filename);

describe(dirname + '/' + filename, function () {
  describe('select', function () {
    const fn = lib[this.title];

    it('returns', function () {
      const ruleSet = [{when: _.constant(true), then: _.constant('a')}];

      expect(fn(ruleSet)).to.deep.equal(ruleSet);
    });

    it('does not return false rules', function () {
      const firstRule = {when: _.constant(false), then: _.constant('a')},
        secondRule = {when: _.constant(true), then: _.constant('b')},
        ruleSet = [firstRule, secondRule];

      expect(fn(ruleSet)).to.deep.equal([secondRule]);
    });

    it('returns empty array if none pass', function () {
      const firstRule = {when: _.constant(false), then: _.constant('a')},
        ruleSet = [firstRule];

      expect(fn(ruleSet)).to.deep.equal([]);
    });

    it('returns when true', function () {
      const ruleSet = [{when: true, then: _.constant('a')}];

      expect(fn(ruleSet)).to.deep.equal(ruleSet);
    });
  });

  describe('first', function () {
    const fn = lib[this.title];

    it('returns', function () {
      const ruleSet = [{when: _.constant(true), then: _.constant('a')}];

      expect(fn(ruleSet)).to.equal('a');
    });

    it('skips false rules', function () {
      const firstRule = {when: _.constant(false), then: _.constant('a')},
        secondRule = {when: _.constant(true), then: _.constant('b')},
        ruleSet = [firstRule, secondRule];

      expect(fn(ruleSet)).to.equal('b');
    });

    it('returns first passing', function () {
      const firstRule = {when: _.constant(false), then: _.constant('a')},
        secondRule = {when: _.constant(true), then: _.constant('b')},
        thirdRule = {when: _.constant(true), then: _.constant('c')},
        ruleSet = [firstRule, secondRule, thirdRule];

      expect(fn(ruleSet)).to.equal('b');
    });

    it('returns undefined if none pass', function () {
      const firstRule = {when: _.constant(false), then: _.constant('a')},
        ruleSet = [firstRule];

      expect(fn(ruleSet)).to.equal(undefined);
    });
  });

  describe('all', function () {
    const fn = lib[this.title];

    it('returns', function () {
      const ruleSet = [{when: _.constant(true), then: _.constant('a')}];

      expect(fn(ruleSet)).to.deep.equal(['a']);
    });

    it('skips false rules', function () {
      const firstRule = {when: _.constant(false), then: _.constant('a')},
        secondRule = {when: _.constant(true), then: _.constant('b')},
        ruleSet = [firstRule, secondRule];

      expect(fn(ruleSet)).to.deep.equal(['b']);
    });

    it('returns all passing', function () {
      const firstRule = {when: _.constant(false), then: _.constant('a')},
        secondRule = {when: _.constant(true), then: _.constant('b')},
        thirdRule = {when: _.constant(true), then: _.constant('c')},
        ruleSet = [firstRule, secondRule, thirdRule];

      expect(fn(ruleSet)).to.deep.equal(['b', 'c']);
    });

    it('returns empty array if none pass', function () {
      const firstRule = {when: _.constant(false), then: _.constant('a')},
        ruleSet = [firstRule];

      expect(fn(ruleSet)).to.deep.equal([]);
    });
  });
});