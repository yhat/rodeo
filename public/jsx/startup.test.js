'use strict';

const expect = require('chai').expect,
  React = require('react/addons'),
  path = require('path'),
  TestUtils = React.addons.TestUtils;

describe('startup', function () {
  let shallowRenderer;

  beforeEach(function () {
    shallowRenderer = TestUtils.createRenderer();
  });

  describe('getInitialState', function () {
    it('initializes', function () {
      var Startup = window.Startup;

      shallowRenderer.render(React.createElement(Startup, {}, ''));

      const component = shallowRenderer.getRenderOutput();

      expect(component.props.className).to.equal('jumbotron');
    });
  });
});