import _ from 'lodash';
import React from 'react';
import Marked from '../marked/marked.jsx';
import PythonTestInput from './python-test-input.jsx';
import SetupListItem from './setup-list-item.jsx';
import LogoRodeoLarge from '../brand-splashes/logo-rodeo-large.jsx';
import SetupLoadingIcon from './setup-loading-icon.jsx';
import './setup.css';

/**
 * @class Setup
 * @extends ReactComponent
 */
export default React.createClass({
  displayName: 'Setup',
  propTypes: {
    ask: React.PropTypes.string,
    onAsk: React.PropTypes.func.isRequired,
    onCmd: React.PropTypes.func.isRequired,
    onInstall: React.PropTypes.func.isRequired,
    onReady: React.PropTypes.func.isRequired,
    onSaveTest: React.PropTypes.func.isRequired,
    onTest: React.PropTypes.func.isRequired,
    pythonTest: React.PropTypes.object,
    pythonValidity: React.PropTypes.oneOf(['good', 'bad', 'ugly'])
  },
  render: function () {
    const props = this.props;
    let content, warning;

    if (props.warning) {
      warning = <p className="warning">{props.warning}</p>;
    }

    if (props.ask) {
      if (props.ask === 'MISSING') {
        content = (
          <div className="setup-content">
            <Marked>{props.installInstructions}</Marked>
            {warning}
            <ul className="horizontal">
              <SetupListItem onClick={_.partial(props.onAsk, 'MANUAL_OR_MISSING')}>{'Back'}</SetupListItem>
              <SetupListItem onClick={props.onInstall}>{'I\'ve done it'}</SetupListItem>
            </ul>
          </div>
        );
      } else if (props.ask === 'MANUAL') {
        content = (
          <div className="setup-content">
            <p>{'Where is python?'}</p>
            <Marked className="faded">{props.examples}</Marked>
            <ul className="horizontal">
              <PythonTestInput onTest={props.onTest} {...props.pythonTest} />
              <SetupListItem onClick={_.partial(props.onAsk, 'MANUAL_OR_MISSING')}>{'Back'}</SetupListItem>
              <SetupListItem disabled={props.pythonTest.status === 'valid'} onClick={_.partial(props.onAsk, 'MISSING')}>{'Still not working'}</SetupListItem>
              <SetupListItem
                disabled={props.pythonTest.status !== 'valid'}
                onClick={_.partial(props.onSaveTest, props.pythonTest.cmd)}
              >{'OK'}</SetupListItem>
            </ul>
          </div>
        );
      } else {
        content = (
          <div className="setup-content">
            <Marked>{props.rejectedInstructions}</Marked>
            <ul>
              <SetupListItem onClick={_.partial(props.onAsk, 'MANUAL')}>{'Let me set the path manually'}</SetupListItem>
              <SetupListItem onClick={_.partial(props.onAsk, 'MISSING')}>{'I don\'t have python installed'}</SetupListItem>
            </ul>
          </div>
        );
      }
    } else {
      content = (
        <div className="setup-content">
          <SetupLoadingIcon isLoading={props.pythonValidity !== 'good'} label="Detecting and Configuring Jupyter"/>
          <ul>
            <SetupListItem
              disabled={props.pythonValidity !== 'good'}
              onClick={props.onReady}
            >{'Ready to Rodeo!'}</SetupListItem>
          </ul>
        </div>
      );
    }

    return (
      <div className="setup">
        <header><LogoRodeoLarge /></header>
        {content}
      </div>
    );
  }
});
