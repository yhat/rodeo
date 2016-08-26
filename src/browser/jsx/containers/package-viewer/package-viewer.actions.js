import {local} from '../../services/store';
import clientDiscovery from '../../services/client-discovery';

export function detectPackages() {
  return function (dispatch) {
    const cmd = local.get('pythonCmd');

    if (cmd) {
      return clientDiscovery.checkKernel({cmd}).then(function (result) {
        const packages = result.packages;

        dispatch({type: 'PACKAGES_DETECTED', packages});
      }).catch(error => console.error(error));
    }
  };
}

export default {
  detectPackages
};
