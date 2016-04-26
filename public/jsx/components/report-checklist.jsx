/* globals React, ReportChecklistItem */
'use strict';

const ReportChecklist = window.ReportChecklist = function ReportChecklist({list}) {
  const elList = list.map((item, i) => (
    <ReportChecklistItem {...item}
      key={i}
    />
  ));

  return (
    <ul className="col-sm-4 col-sm-offset-4">
      {elList}
    </ul>
  );
};

ReportChecklist.propTypes = {
  list: React.PropTypes.array.isRequired
};