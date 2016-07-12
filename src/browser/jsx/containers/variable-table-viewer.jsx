import _ from 'lodash';
import React from 'react';
import client from '../services/client';
import DataFrame from '../components/data-frame/data-frame.jsx';

function removeWrappedSingleQuotes(text) {
  // sometimes ipython throws things in single quotes, and single quotes are not valid JSON.
  if (text && text[0] === '\'' && text[text.length - 1] === '\'') {
    text = text.substr(1, text.length - 2);
  }

  return text;
}

/**
 * @class DataFrameViewer
 * @extends ReactComponent
 * @property {object} props
 */
export default React.createClass({
  displayName: 'DataFrameViewer',
  propTypes: {
    filter: React.PropTypes.string,
    options: React.PropTypes.object.isRequired
  },
  getInitialState: function () {
    return {

    };
  },
  componentDidMount: function () {
    const props = this.props,
      item = _.get(props, 'options.item'),
      setData = this.setData,
      setError = this.setError;

    if (item && item.name) {
      client.executeHidden(item.name + '.to_json(orient="split")', ['stream', 'execute_reply', 'display_data', 'execute_result', 'error']).then(function (result) {
        console.log(result);
        let obj,
          text = _.get(result, 'data["text/plain"]');

        // sometimes ipython throws things in single quotes, and single quotes are not valid JSON.
        text = removeWrappedSingleQuotes(text);

        try {
          obj = JSON.parse(text);
        } catch (ex) {
          console.error(ex);
        }

        if (obj) {
          setData(obj);
        }
      }).catch(function (error) {
        setError(error);
      });
    }
  },
  setData: function (data) {
    this.setState({data});
  },
  setError: function (error) {
    this.setState({error});
  },
  render: function () {
    const props = this.props,
      state = this.state;
    let content;

    if (props.options.item && state.data) {
      if (props.options.item.type == 'DataFrame') {
        content = <DataFrame data={state.data} />;
      }
    }

    if (!content) {
      content = <div></div>;
    }

    return content;
  }
});
