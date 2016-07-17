import cid from '../../services/cid';

function showDataFrame(item) {
  return function (dispatch) {
    const dataFrameOptions = {item};

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
  };
}

export default {
  showDataFrame
};
