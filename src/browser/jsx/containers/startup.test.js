import {expect} from 'chai';
import sinon from 'sinon';
import React from 'react';
import TestUtils from 'react-addons-test-utils';
import Startup from './startup.jsx';
import SetupViewer from './setup-viewer/setup-viewer.jsx';

describe('startup', function () {
  let shallowRenderer, sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    sandbox.stub(SetupViewer);
    shallowRenderer = TestUtils.createRenderer();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('getInitialState', function () {
    it('initializes', function () {
      shallowRenderer.render(React.createElement(Startup, {}, ''));

      const component = shallowRenderer.getRenderOutput();

      console.log(JSON.stringify(component));

      expect(component.props.className).to.equal('jumbotron');
    });
  });
});
