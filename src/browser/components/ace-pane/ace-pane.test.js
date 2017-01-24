/* globals describe, it, expect, jest */

jest.mock('ace');
jest.mock('../../services/ace-shortcuts');
jest.mock('../../services/ace-settings');

import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import AcePane from './ace-pane';

function handleNoop() {
  // do nothing
}

describe(__filename, () => {
  it('renders', () => {
    const reactDocument = TestUtils.renderIntoDocument(
        <AcePane
          fontSize={1}
          highlightLine
          mode=""
          onChange={handleNoop}
          onClick={handleNoop}
          onLoadError={handleNoop}
          onLoaded={handleNoop}
          onLoading={handleNoop}
          onModeChange={handleNoop}
          onShowGoToLine={handleNoop}
          tabSize={1}
          theme=""
          useSoftTabs
          value=""
        />
      ),
      el = ReactDOM.findDOMNode(reactDocument);

    expect(el.className).toEqual('ace-pane');
  });
});
