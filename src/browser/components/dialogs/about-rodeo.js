import React from 'react';
import Marked from '../marked';
import ActionButton from '../action-button';
import dialogActions from '../../actions/dialogs';
import rodeoTextDarkImage from './rodeo-text-dark.png';
import commonReact from '../../services/common-react';
import './about-rodeo.css';

export default React.createClass({
  displayName: 'AboutRodeo',
  contextTypes: {
    text: React.PropTypes.object
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render() {
    const className = commonReact.getClassNameList(this),
      text = this.context.text;

    return (
      <div className={className.join(' ')}>
        <img src={rodeoTextDarkImage}/>
        <div className="version">{__VERSION__}</div>
        <Marked>{text.builtByYhat}</Marked>
        <Marked>{text.includesOpenSource}</Marked>
        <ActionButton action={dialogActions.showAcknowledgements()} className="btn btn-primary">
          {text.acknowledgements}
        </ActionButton>
        <Marked>{text.usageMetrics}</Marked>
      </div>
    );
  }
});
