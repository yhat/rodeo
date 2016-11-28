import api from '../api';

function copyCondaToHome() {
  return api.send('copyCondaToHome');
}

export default {
  copyCondaToHome
};
