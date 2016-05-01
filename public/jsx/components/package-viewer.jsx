import React from 'react';

export default React.createClass({
  displayName: 'PackagesViewer',
  render: function () {
    return (
      <div>
        <div className="row">
          <div className="col-sm-4">
            <button
              className="btn btn-primary btn-xs"
              id="package-install-button"
            ><i className="fa fa-download"/>{'&nbsp;&nbsp;Install Package'}
            </button>
          </div>
          <div className="col-sm-5 col-sm-offset-3">
            <div className="input-group">
              <div className="input-group-addon"><i className="fa fa-search"/></div>
              <input className="form-control input-sm"
                id="pkg-search"
                placeholder="(i.e. pandas, Flask)"
                type="text"
              />
            </div>
          </div>
        </div>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>{'package'}</th>
              <th>{'version'}</th>
            </tr>
          </thead>
        </table>
        <div id="packages-container">
          <table className="table table-bordered">
            <tbody id="packages-rows">
            </tbody>
          </table>
        </div>
      </div>
    );
  }
});