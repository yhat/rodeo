import cid from '../../services/cid';
import applicationControl from '../../services/application-control';

function showDataFrame() {
  return function () {
    const name = cid(),
      options = {
        url: 'freeTabsOnlyWindow'
      };

    return applicationControl.createWindow(name, options);
  };
}

export default {
  showDataFrame
};
