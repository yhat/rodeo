import React from 'react';
import ReactDOM from 'react-dom';
import validation from '../../services/validation';
import './stickers-pane.css';
import {local} from '../../services/store';
import rodeoImage from '../forms/rodeo-logo.png';

const storeKey = 'stickersRequested';

export default React.createClass({
  displayName: 'StickersPane',
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  getInitialState: function () {
    return {
      hasRegistered: local.get(storeKey),
      justRegistered: false,
      error: ''
    };
  },
  handleEmail: function () {
    const el = ReactDOM.findDOMNode(this),
      inputEl = el && el.querySelector('input'),
      text = this.context.text,
      email = inputEl && inputEl.value;

    if (validation.isEmail(email)) {
      this.setState({justRegistered: true});
      local.set(storeKey, true);
      if (!window.__DEV__ && window.Intercom) {
        window.Intercom('update', { email: email });
      }
    } else {
      this.setState({error: text.invalidEmail});
    }
  },
  render: function () {
    let content,
      text = this.context.text,
      state = this.state;

    if (state.hasRegistered) {
      content = (
        <div>
          {text.thankYou}
          <div className="stickers-pane__logo"><img src={rodeoImage}/></div>
          {text.alreadySignedUp}
        </div>
      );
    } else if (state.justRegistered) {
      content = (
        <div>
          {text.thankYou}
          <div className="stickers-pane__logo"><img src={rodeoImage}/></div>
          {text.weWillContactYou}
        </div>
      );
    } else {
      let help;

      if (state.error) {
        help = <p className="help-block text-muted" >{state.error}</p>;
      }

      content = (
        <div>
          <div>
            {text.wantAFreeSticker}
            <div className="stickers-pane__logo"><img src={rodeoImage}/></div>
            {text.sendUsYourEmail}
          </div>
          <div className="form-group">
            <div className="input-group">
              <input className="form-control" placeholder="smugdouglas@gmail.com" required="required" type="email"/>
              <div className="input-group-btn">
                <button className="btn btn-primary" onClick={this.handleEmail}>{text.sendMeStickers}</button>
              </div>
            </div>
          </div>

          {help}
        </div>
      );
    }

    return <div className="stickers-pane">{content}</div>;
  }
});
