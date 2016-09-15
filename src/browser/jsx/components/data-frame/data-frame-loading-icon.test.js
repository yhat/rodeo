/* globals describe, it, expect, jest */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import DataFrameLoadingIcon from './data-frame-loading-icon.jsx';

jest.useFakeTimers()

describe('UnsafeHtml', () => {

  it('renders html with opacity 0 at first', () => {
    const reactDocument = TestUtils.renderIntoDocument(<DataFrameLoadingIcon isLoading label="abc" />),
      el = ReactDOM.findDOMNode(reactDocument);

    expect(el.style.getPropertyValue('opacity')).toEqual('0');
  });

  it('renders html with opacity 1 right after', () => {
    const reactDocument = TestUtils.renderIntoDocument(<DataFrameLoadingIcon isLoading label="abc" />),
      el = ReactDOM.findDOMNode(reactDocument);

    jest.runAllTimers();

    expect(el.style.getPropertyValue('opacity')).toEqual('1');
  });
});
