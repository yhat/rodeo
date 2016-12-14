/* globals describe, it, expect */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import UnsafeHtml from './unsafe-html.js';

describe(__filename, () => {
  it('renders html', () => {
    const reactDocument = TestUtils.renderIntoDocument(<UnsafeHtml id="abc" src="abc"/>),
      el = ReactDOM.findDOMNode(reactDocument);

    expect(el.src).toEqual('abc');
  });
});
