import React from 'react';

/**
 * @class HistoryViewer
 * @extends ReactComponent
 * @property props
 */
export default React.createClass({
  displayName: 'HistoryViewer',
  render: function () {
    return (
      <div>
        <div className="row">
          <div className="col-sm-5 col-sm-offset-7">
            <div className="input-group">
              <div className="input-group-addon"><i className="fa fa-search"/></div>
              <input className="form-control input-sm"
                id="history-search"
                placeholder="filter..."
                type="text"
              />
            </div>
          </div>
        </div>
        <div className="top-right history container"
          id="history-trail"
        ></div>
      </div>
    );
  }
});
