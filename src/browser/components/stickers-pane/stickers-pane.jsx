import React from 'react';
import ReactDOM from 'react-dom';
import Marked from '../marked/marked.jsx';
import validation from '../../services/validation';
import './stickers-pane.css';
import wantAFreeStickerText from './want-a-free-sticker.md';
import thanksText from './thanks.md';
import {local} from '../../services/store';
import rodeoImage from './rodeo-logo.png';
import text from './text.yml';

const storeKey = 'stickersRequested';

/**
 * @class StickersPane
 * @extends ReactComponent
 * @property props
 * @property state
 */
export default React.createClass({
  displayName: 'StickersPane',
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
      email = inputEl && inputEl.value;

    if (validation.isEmail(email)) {
      this.setState({justRegistered: true});
      local.set(storeKey, true);
      if (!window.__DEV__ && window.Intercom) {
        window.Intercom('update', { email: email });
      }
    } else {
      this.setState({error: 'Please input a valid email address.'});
    }
  },
  render: function () {
    let content,
      state = this.state;

    if (state.hasRegistered) {
      content = (
        <div>
          {text.thankYou}
          <img src={rodeoImage} style="height: 100px;"/>
          {text.alreadySignedUp}
        </div>
      );
    } else if (state.justRegistered) {
      content = (
        <div>
          {text.thankYou}
          <img src={rodeoImage} style="height: 100px;"/>
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
            <img src={rodeoImage} style="height: 100px;"/>
            {text.sendUsYourEmail}
          </div>
          <div className="form-group">
            <div className="input-group">
              <input className="form-control" placeholder="smugdouglas@gmail.com" required="required" type="email"/>
              <div className="input-group-btn">
                <button className="btn btn-primary" onClick={this.handleEmail}>{'Send me stickers!'}</button>
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
