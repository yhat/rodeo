/* globals describe, it, expect, jest */

jest.mock('ace');
jest.mock('../../services/ace-shortcuts');
jest.mock('../../services/ace-settings');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import AcePane from './ace-pane';

describe(__filename, () => {
  it('renders', () => {
    const reactDocument = TestUtils.renderIntoDocument(<AcePane />),
      el = ReactDOM.findDOMNode(reactDocument);

    expect(el.className).toEqual('ace-pane font-monospaced');
  });
});
