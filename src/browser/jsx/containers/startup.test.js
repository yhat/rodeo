const expect = require('chai').expect,
  React = require('react/addons'),
  TestUtils = React.addons.TestUtils;

describe('startup', function () {
  let shallowRenderer, Startup;

  before(function () {
    Startup = window.Startup;
  });

  beforeEach(function () {
    shallowRenderer = TestUtils.createRenderer();
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