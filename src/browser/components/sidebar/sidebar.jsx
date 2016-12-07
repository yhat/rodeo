import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import SidebarItem from './sidebar-item.jsx';
import SlideoutDialog from './slideout-dialog.jsx';
import './sidebar.css';
import logoPython from './logo-python.svg';
import logoScienceOps from './logo-scienceops.png';
import logoYhat from './logo-yhat.svg';
import actions from './sidebar.actions';
import dialogActions from '../../actions/dialogs';
import commonReact from '../../services/common-react';

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
    onOpenURL: (url) => dispatch(actions.openURL(url)),
    onShowURL: (url) => dispatch(actions.showURL(url)),
    onShowPreferences: () => dispatch(dialogActions.showPreferences())
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
    onOpenURL: React.PropTypes.func,
    onShowPreferences: React.PropTypes.func,
    onShowURL: React.PropTypes.func,
    url: React.PropTypes.string
  },
  componentDidMount: function () {
    const el = ReactDOM.findDOMNode(this);

    _.defer(() => el.classList.add(showClass));
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <section className={className.join(' ')}>
        <SlideoutDialog isExpanded={props.isExpanded} url={props.url} />
        <div className="sidebar-container">
          <div className="sidebar-top">
            <SidebarItem onClick={_.partial(props.onShowURL, 'https://www.yhat.com/ops-demo-within-rodeo')}>
              <span><img src={logoScienceOps}/></span>
              <span>{'ScienceOps'}</span>
            </SidebarItem>
            <SidebarItem onClick={_.partial(props.onShowURL, 'http://blog.yhat.com/tutorials/index.html')}>
              <span><img src={logoPython}/></span>
              <span>{'Tutorials'}</span>
            </SidebarItem>
            <SidebarItem onClick={_.partial(props.onOpenURL, 'http://blog.yhat.com/index.html')}>
              <span><img src={logoYhat}/></span>
              <span>{'Yhat Blog'}</span>
            </SidebarItem>
          </div>
          <SidebarItem onClick={_.partial(props.onOpenURL, 'http://rodeo.yhat.com/docs/')}>
            <span className="fa fa-question" />
            <span>{'Docs'}</span>
          </SidebarItem>
          <SidebarItem onClick={_.partial(props.onOpenURL, 'http://discuss.yhat.com/')}>
            <span className="fa fa-users" />
            <span>{'Feedback'}</span>
          </SidebarItem>
          <SidebarItem onClick={_.partial(props.onOpenURL, 'https://github.com/yhat/rodeo/')}>
            <span className="fa fa-github" />
            <span>{'Github'}</span>
          </SidebarItem>
          <SidebarItem onClick={props.onShowPreferences}>
            <span className="fa fa-cogs" />
            <span>{'Settings'}</span>
          </SidebarItem>
        </div>
      </section>
    );
  }
}));
