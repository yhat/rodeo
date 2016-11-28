/* globals describe, it, expect, jest */

jest.mock('./default-commands.yml', function () {
  return {keyDown: [], keyDownByOS: [], keyPress: []};
});

import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import PromptViewer from './prompt-viewer';
import { mount } from 'enzyme';

describe(__filename, () => {
  it('renders', () => {
    const handleNoop = _.noop,
      reactDocument = TestUtils.renderIntoDocument(
        <PromptViewer
          onAutocomplete={handleNoop}
          onCommand={handleNoop}
          onExecute={handleNoop}
          onInput={handleNoop}
        />
      ),
      el = ReactDOM.findDOMNode(reactDocument);

    expect(el.className).toEqual('prompt prompt-viewer');
  });

  it('supports international keys using alt and shift 1', () => {
    const handleNoop = _.noop,
      handleCommand = jest.fn(() => true),
      wrapper = mount(
        <PromptViewer
          onAutocomplete={handleNoop}
          onCommand={handleCommand}
          onExecute={handleNoop}
          onInput={handleNoop}
        />
      );

    wrapper.find('.prompt-viewer').simulate('keyPress', {
      key: '[',
      altKey: true,
      ctrlKey: false,
      metaKey: false,
      shiftKey: true
    });

    expect(handleCommand).toBeCalledWith({name: 'insertKey', key: '['});
  });
});
