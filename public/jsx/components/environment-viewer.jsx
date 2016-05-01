import React from 'react';

export default React.createClass({
  displayName: 'EnvironmentViewer',
  render: function () {
    return (
      <div>
        <div className="row">
          <div className="col-sm-5 col-sm-offset-7">
            <div className="input-group">
              <div className="input-group-addon"><i className="fa fa-search"/></div>
              <input className="form-control input-sm"
                id="variable-search"
                placeholder="filter..."
                type="text"
              />
            </div>
          </div>
        </div>
        <table className="table table-bordered">
          <thead>
            <tr id="vars-header">
              <th>{'Variable'}</th>
              <th/>
              <th/>
            </tr>
          </thead>
        </table>
        <div id="vars-container">
          <table className="table table-bordered">
            <tbody id="vars">
            </tbody>
          </table>
        </div>
      </div>
    );
  }
});