import { AppContainer } from 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import App from '../containers/main.jsx';
import track from '../services/track';

track('application', 'editor');

const rootEl = document.querySelector('main');

ReactDOM.render(
  <AppContainer>
    <App />
  </AppContainer>,
  rootEl
);

if (module.hot) {
  module.hot.accept('./../containers/main.jsx', () => {
    // If you use Webpack 2 in ES modules mode, you can
    // use <App /> here rather than require() a <NextApp />.
    const NextApp = require('./../containers/main.jsx').default;

    ReactDOM.render(
      <AppContainer>
        <NextApp />
      </AppContainer>,
      rootEl
    );
  });
}

ReactDOM.render(React.createElement(App, null), document.querySelector('main'));
