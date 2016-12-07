import { AppContainer } from 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import App from '../containers/main.jsx';
import track from '../services/track';
import {local} from '../services/store';

track({
  category: 'application',
  action: 'editor',
  label: 'tracking',
  value: local.get('trackMetrics') !== false ? 1 : 0,
  force: true,
  sessionControl: 'start'
});

// are they able to run multiple times?
(function () {
  // Used to determine if we should fall back to the build-in python automatically
  // We only do that the first few times python is run
  let key = 'pythonRuns',
    runs = local.get(key);

  if (!runs) {
    runs = [];
  }

  if (runs.length < 10) {
    runs.push(new Date().getTime());
    local.set(key, runs);
    track({category: 'application', action: 'run:' + runs.length});
  }
}());

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
