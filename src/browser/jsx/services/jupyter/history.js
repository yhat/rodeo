import _ from 'lodash';
import cid from '../cid';

function responseToHistoryBlockItem(response) {
  let buffer = _.get(response, 'result.content');

  if (_.isObject(buffer)) {
    buffer = JSON.stringify(buffer);

    return {id: cid(), chunks: [{id: cid(), buffer}], type: 'textStream'};
  }
}

export default {
  responseToHistoryBlockItem
}
