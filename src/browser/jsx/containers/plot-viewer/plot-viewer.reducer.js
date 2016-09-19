import _ from 'lodash';
import cid from '../../services/cid';
import mapReducers from '../../services/map-reducers';

const maxPlots = 50;

export function getInitialState() {
  return {
    plots: []
  };
}
