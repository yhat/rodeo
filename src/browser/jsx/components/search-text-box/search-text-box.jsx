import _ from 'lodash';
import React from 'react';
import './search-text-box.css';
import commonReact from '../../services/common-react';

/**
 * @class FilterTextBox
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'FilterTextBox',
  propTypes: {
    className: React.PropTypes.string,
    onChange: React.PropTypes.func,
    placeholder: React.PropTypes.string
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  handleFilterChange: _.debounce(function () {
    const value = this.refs.search.value;

    this.props.onChange(value);
  }, 300),
  render: function () {
    const className = ['search-text-box', this.props.className].join(' ');

    return (
      <div className={className}>
        <div className="search-text-box-icon">
          <span className="fa fa-search"/>
        </div>
        <input
          onChange={this.handleFilterChange}
          placeholder={this.props.placeholder}
          ref="search"
        />
      </div>
    );
  }
});
