/**
 * Currently, we use ipc to communicate to the API.  In the future, this will change
 * @module
 */

import ipc from 'ipc';
import bluebird from 'bluebird';

export default {
  send: bluebird.method(ipc.send),
  on: ipc.on
};
