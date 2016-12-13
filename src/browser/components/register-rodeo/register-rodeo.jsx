import _ from 'lodash';
import $ from 'jquery';
import registration from '../../services/registration';
import React from 'react';
import ReactDOM from 'react-dom';
import Marked from '../marked';
import Logo from '../brand-splashes/logo-rodeo-square-large.jsx';
import LabelInput from '../label-input.jsx';
import LabelChecklist from '../label-checklist.jsx';
import LabelCheckbox from '../label-checkbox.jsx';
import explanation from './explanation.md';
import areasOfInterest from './areas-of-interest.yml';
import './register-rodeo.css';

export default React.createClass({
  displayName: 'RegisterRodeo',
  propTypes: {
    onOK: React.PropTypes.func.isRequired
  },
  contextTypes: {
    store: React.PropTypes.object
  },
  handleSubmit: function (event) {
    event.preventDefault();

    const props = this.props,
      el = ReactDOM.findDOMNode(this);

    // until Chrome 50 is out and we can use FormData
    let data = _.reduce($(el.querySelector('form')).serializeArray(), function (result, item) {
      result[item.name] = item.value;
      return result;
    }, {});

    return registration.register(data)
      .then(props.onOK);
  },
  handleRegister: function () {
    const el = ReactDOM.findDOMNode(this),
      inputList = el.querySelectorAll('input');

    _.each(inputList, function (inputEl) {
      const parent = inputEl.parentNode,
        errorClass = 'validation-message';
      let p = parent.querySelector('.' + errorClass);

      if (!inputEl.checkValidity()) {
        if (!p) {
          p = document.createElement('p');
          p.classList.add(errorClass);
        }

        p.innerHTML = inputEl.validationMessage;

        inputEl.parentNode.appendChild(p);
      } else if (p) {
        parent.removeChild(p);
      }
    });
  },
  render: function () {
    return (
      <div className="register-rodeo">
        <div className="container">
          <Logo />
          <Marked>{explanation}</Marked>
          <form className="column" onSubmit={this.handleSubmit}>
            <div className="row-wide">
              <div className="row-wide-item">
                <LabelInput label="First Name" name="firstName" required/>
                <LabelInput label="Last Name" name="lastName" required/>
                <LabelInput label="Email" name="emailAddress" required type="email"/>
                <LabelInput label="Company" name="company"/>
              </div>
              <div className="row-wide-item">
                <LabelChecklist label={areasOfInterest.label}>
                  {areasOfInterest.items.map(item => <LabelCheckbox {...item}/>)}
                </LabelChecklist>
              </div>
            </div>
            <div className="row-thin">
              <button className="btn btn-default" onClick={this.props.onOK}>{'Skip for today'}</button>
              <button className="btn btn-primary" onClick={this.handleRegister} type="submit">{'Register'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
});
