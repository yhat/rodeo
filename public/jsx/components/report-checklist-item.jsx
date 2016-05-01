import React from 'react';

function ReportChecklistItem({ok, label}) {
  return (
    <li className={ok ? 'list-group-item list-group-item-success' : 'list-group-item list-group-item-danger'}>
      {label}
      <span className={ok ? 'fa fa-check' : 'fa fa-times'} />
    </li>
  );
}

ReportChecklistItem.propTypes = {
  label: React.PropTypes.string.isRequired,
  ok: React.PropTypes.bool.isRequired
};

export default ReportChecklistItem;