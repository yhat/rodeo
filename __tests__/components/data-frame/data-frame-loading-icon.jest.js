/* globals describe, it, expect, jest */

jest.unmock('../../../src/browser/jsx/components/data-frame/data-frame-loading-icon.jsx');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import ComponentUnderTest from '../../../src/browser/jsx/components/data-frame/data-frame-loading-icon.jsx';

describe('UnsafeHtml', () => {

  it('renders html with opacity 0 at first', () => {
    const reactDocument = TestUtils.renderIntoDocument(<ComponentUnderTest isLoading label="abc" />),
      el = ReactDOM.findDOMNode(reactDocument);

    expect(el.style.getPropertyValue('opacity')).toEqual('0');
  });

  it('renders html with opacity 1 right after', () => {
    const reactDocument = TestUtils.renderIntoDocument(<ComponentUnderTest isLoading label="abc" />),
      el = ReactDOM.findDOMNode(reactDocument);

    jest.runAllTimers();

    expect(el.style.getPropertyValue('opacity')).toEqual('1');
  });
});
