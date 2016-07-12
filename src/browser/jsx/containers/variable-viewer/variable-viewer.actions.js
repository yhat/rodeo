import cid from '../../services/cid';
import applicationControl from '../../services/application-control';

function showDataFrame(item) {
  return function (dispatch) {
    const name = cid(),
      dataFrameOptions = {item},
      windowOptions = {
        url: 'freeTabsOnlyWindow'
      };

    dispatch({
      type: 'CREATE_TAB',
      hasFocus: true,
      id: cid(),
      isCloseable: true,
      tabId: cid(),
      options: dataFrameOptions,
      contentType: 'variable-table-viewer',
      icon: 'table',
      label: item.name || 'Table'
    });

    // return applicationControl.createWindow(name, windowOptions);
  };
}

export default {
  showDataFrame
};
