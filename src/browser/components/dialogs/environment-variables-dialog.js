import _ from 'lodash';
import React from 'react';
import FormList from '../forms/form-list';
import SaveChangesButtonGroup from '../forms/save-changes-button-group';
import commonReact from '../../services/common-react';
import './environment-variables-dialog.css';

export default React.createClass({
  displayName: 'EnvironmentVariablesDialog',
  propTypes: {
    active: React.PropTypes.string.isRequired,
    canSave: React.PropTypes.bool.isRequired,
    changes: React.PropTypes.object.isRequired,
    onApply: React.PropTypes.func.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onOK: React.PropTypes.func.isRequired,
    onTabClick: React.PropTypes.func.isRequired,
    preferenceMap: React.PropTypes.array.isRequired
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this),
      fns = _.pickBy(props, _.isFunction);

    return (
      <section className={className.join(' ')}>
        <div className="environment-variables-dialog__content">
          <FormList {...fns} changes={props.changes} items={props.items} />
        </div>
        <footer>
          <SaveChangesButtonGroup
            canSave={props.canSave}
            hasChanges={_.size(props.changes) > 0}
            onCancel={props.onCancel}
            onOK={props.onOK}
            onSave={props.onApply}
          />
        </footer>
      </section>
    );
  }
});
