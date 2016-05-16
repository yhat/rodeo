import React from 'react';
import ReactDOM from 'react-dom';
import Marked from '../marked/marked.jsx';
import validation from '../../services/validation';
import './stickers-pane.css';
import wantAFreeStickerText from './want-a-free-sticker.md';
import thanksText from './thanks.md';
import alreadyDoneText from './already-done.md';
import * as store from '../../services/store';

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
      hasRegistered: store.get(storeKey),
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
      store.set(storeKey, true);
      if (!window.__DEV__) {
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
      content = <Marked>{alreadyDoneText}</Marked>;
    } else if (state.justRegistered) {
      content = <Marked>{thanksText}</Marked>;
    } else {
      let help;

      if (state.error) {
        help = <p className="help-block text-muted" >{state.error}</p>;
      }

      content = (
        <div>
          <Marked>{wantAFreeStickerText}</Marked>

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
