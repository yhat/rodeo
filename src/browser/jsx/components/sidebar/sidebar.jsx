import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import SlideoutDialog from './slideout-dialog.jsx';
import './sidebar.css';
import actions from './sidebar.actions';

const showClass = 'sidebar-show';

/**
 * @param {object} state
 * @returns {object}
 */
function mapStateToProps(state) {
  // pick the first terminal (we can add more later to this view?)
  return state.sidebar;
}

/**
 * @param {function} dispatch
 * @returns {object}
 */
function mapDispatchToProps(dispatch) {
  return {
    onShowURL: (url) => dispatch(actions.showURL(url))
  };
}

/**
 * @class Sidebar
 * @extends ReactComponent
 * @property props
 */
export default connect(mapStateToProps, mapDispatchToProps)(React.createClass({
  displayName: 'Sidebar',
  propTypes: {
    id: React.PropTypes.string,
    isExpanded: React.PropTypes.bool,
    onShowURL: React.PropTypes.func,
    url: React.PropTypes.string
  },
  componentDidMount: function () {
    const el = ReactDOM.findDOMNode(this);


    _.defer(() => el.classList.add(showClass));
  },
  render: function () {
    const props = this.props;

    return (
      <section className="sidebar">
        <SlideoutDialog isExpanded={props.isExpanded} url={props.url} />
        <div className="sidebar-container">
          <div className="sidebar-item" onClick={_.partial(props.onShowURL, 'http://blog.yhat.com/tutorials/index.html')}></div>
          <div className="sidebar-item"></div>
          <div className="sidebar-item"></div>
        </div>
      </section>
    );
  }
}));
