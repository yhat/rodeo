/* globals describe, it, expect, jest */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import TabList from './tab-list.js';

describe(__filename, () => {
  it('renders', () => {
    const reactDocument = TestUtils.renderIntoDocument(<TabList />),
      el = ReactDOM.findDOMNode(reactDocument);

    expect(el.className).toEqual('tab-list');
  });
});
