/* globals describe, it, expect, jest */

jest.unmock('../../../src/browser/jsx/components/tabs/tab-list.js');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import ComponentUnderTest from '../../../src/browser/jsx/components/tabs/tab-list.js';

describe(__filename, () => {

  it('renders', () => {
    const reactDocument = TestUtils.renderIntoDocument(<ComponentUnderTest />),
      el = ReactDOM.findDOMNode(reactDocument);

    expect(el.className).toEqual('tab-list');
  });
});
