import React from 'react';
import Marked from '../marked/marked.jsx';
import ActionButton from '../action-button.jsx';
import dialogActions from '../../actions/dialogs';
import builtByYhat from './built-by-yhat.md';
import includesOpenSource from './includes-open-source.md';
import usageMetrics from './usage-metrics.md';
import './about-rodeo.css';

/**
 * @class StickersPane
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'StickersPane',
  render: function () {
    return (
      <div className="about-rodeo">
        <img src="images/rodeo-text-dark.png"/>
        <Marked>{builtByYhat}</Marked>
        <Marked>{includesOpenSource}</Marked>
        <ActionButton action={dialogActions.showAcknowledgements()} className="btn btn-primary">{'Acknowledgments'}</ActionButton>
        <Marked>{usageMetrics}</Marked>
      </div>
    );
  }
});
