import React from 'react';
import commonReact from '../../services/common-react';
import SetupInstallResultButtons from './setup-install-result-buttons.jsx';

export default React.createClass({
  displayName: 'SetupInstallPackage',
  propTypes: {
    explanationLabel: React.PropTypes.string.isRequired,
    onCancel: React.PropTypes.func.isRequired,
    onPackageInstall: React.PropTypes.func.isRequired,
    packageName: React.PropTypes.string.isRequired,
    terminal: React.PropTypes.object.isRequired
  },
  componentDidMount: function () {
    const props = this.props;

    props.onPackageInstall(props.packageName);
  },
  shouldComponentUpdate: function (nextProps) {
    return commonReact.shouldComponentUpdate(this, nextProps);
  },
  render: function () {
    const props = this.props,
      className = commonReact.getClassNameList(this);

    return (
      <div className={className.join(' ')}>
        <div className="setup-inner">
          <SetupInstallResultButtons {...props} />
        </div>
      </div>
    );
  }
});
