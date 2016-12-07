import _ from 'lodash';
import React from 'react';
import './gray-info.css';
import commonReact from '../../services/common-react';
import textUtils from '../../services/text-util';

export default React.createClass({
  displayName: 'GrayInfoSelect',
  propTypes: {
    onChange: React.PropTypes.func.isRequired,
    options: React.PropTypes.array.isRequired,
    value: React.PropTypes.string.isRequired
  },
  getInitialState: function () {
    return {
      expanded: false
    };
  },
  shouldComponentUpdate: function (nextProps, nextState) {
    return commonReact.shouldComponentUpdate(this, nextProps, nextState);
  },
  handleOptionClick: function (option, event) {
    event.preventDefault();
    event.stopPropagation();

    this.props.onChange(option);
    this.setState({expanded: false});
  },
  handleClick: function (event) {
    event.preventDefault();
    event.stopPropagation();

    this.setState({expanded: true});
  },
  render: function () {
    const props = this.props,
      state = this.state,
      className = commonReact.getClassNameList(this),
      len = textUtils.longestLength(_.map(props.options, 'value')),
      style = {minWidth: len * 10},
      selectedOption = _.find(props.options, {value: props.value});
    let content;

    if (selectedOption) {
      if (state.expanded) {
        const selectedOption = _.find(props.options, {value: props.value}),
          rest = _.without(props.options, selectedOption);

        content = (
          <div className="options" style={style}>
            {_.map(rest, option => (
              <div className="item" key={option.value} onClick={_.partial(this.handleOptionClick, option)}>{option.label}</div>
            ))}
            <div className="item" key={selectedOption.value} onClick={_.partial(this.handleOptionClick, selectedOption)}>{selectedOption.label}</div>
          </div>
        );
      } else {
        content = (
          <div className="single-value item">
            {selectedOption.label}
          </div>
        );
      }
    } else {
      content = null;
    }

    return <div className={className} onClick={this.handleClick} style={style}>{content}</div>;
  }
});
