import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import commonReact from '../../services/common-react';
import './modal-dialog.css';

export default React.createClass({
  displayName: 'ModalDialog',
  propTypes: {
    buttons: React.PropTypes.array,
    onApply: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    onOK: React.PropTypes.func,
    title: React.PropTypes.string
  },
  contextTypes: {
    text: React.PropTypes.object.isRequired
  },
  componentDidMount() {
    const el = ReactDOM.findDOMNode(this);

    _.defer(() => el.classList.add('modal-dialog-instance--visible'));
  },
  shouldComponentUpdate(nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render() {
    const props = this.props,
      className = commonReact.getClassNameList(this);
    let header;

    className.push('modal-dialog-instance');

    if (props.title) {
      header = <header>{props.title}</header>;
    }

    return (
      <section className={className.join(' ')}>
        {header}
        {props.children}
      </section>
    );
  }
});
