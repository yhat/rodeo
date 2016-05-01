import React from 'react';
import ReportChecklistItem from './report-checklist-item';

function ReportChecklist({list}) {
  const elList = list.map((item, i) => (
    <ReportChecklistItem {...item}
      key={i}
    />
  ));

  return <ul className="col-sm-4 col-sm-offset-4">{elList}</ul>;
}

ReportChecklist.propTypes = {
  list: React.PropTypes.array.isRequired
};

export default ReportChecklist;