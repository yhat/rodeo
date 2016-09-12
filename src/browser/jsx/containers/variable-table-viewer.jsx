import _ from 'lodash';
import React from 'react';
import client from '../services/client';
import DataFrame from '../components/data-frame/data-frame.jsx';
import commonReact from '../services/common-react';

/**
 * @class DataFrameViewer
 * @extends ReactComponent
 * @property {object} props
 */
export default React.createClass({
  displayName: 'DataFrameViewer',
  propTypes: {
    content: React.PropTypes.object.isRequired,
    filter: React.PropTypes.string.isRequired
  },
  componentDidMount: function () {
    const props = this.props,
      item = _.get(props, 'content.item'),
      setData = this.setData,
      setError = this.setError;

    if (item && item.name) {
      this.showLoading();
      client.executeHidden('print(' + item.name + '.to_json(orient="split"))', ['stream', 'error']).then(function (result) {
        let obj,
          text = result && result.text;

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
      }).finally(() => this.showLoading(false));
    }
  },
  shouldComponentUpdate: function (nextProps) {
    return !commonReact.shallowEqual(this, nextProps);
  },
  setData: function (data) {
    this.setState({data});
  },
  setError: function (error) {
    this.setState({error});
  },
  /**
   * @param {boolean} [isLoading=true]
   */
  showLoading(isLoading) {
    isLoading = isLoading !== false;

    this.setState({isLoading});
  },
  render: function () {
    const props = this.props,
      state = this.state;
    let content;

    if (props.content.item && props.content.item.type == 'DataFrame') {
      content = <DataFrame data={state.data} isLoading={state.isLoading} />;
    }

    if (!content) {
      content = <div></div>;
    }

    return content;
  }
});
