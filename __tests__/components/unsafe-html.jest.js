/* globals describe, it, expect, jest */

jest.unmock('../../src/browser/jsx/components/unsafe-html.jsx');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import UnsafeHtml from '../../src/browser/jsx/components/unsafe-html.jsx';

describe(__filename, () => {
  it('renders html', () => {
    const reactDocument = TestUtils.renderIntoDocument(<UnsafeHtml id="abc" src="abc"/>),
      el = ReactDOM.findDOMNode(reactDocument);

    expect(el.src).toEqual('abc');
  });
});
