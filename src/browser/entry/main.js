import { AppContainer } from 'react-hot-loader';
import React from 'react';
import ReactDOM from 'react-dom';
import App from '../containers/main.jsx';
import track from '../services/track';
import {local} from '../services/store';

track({
  hitType: 'pageview',
  documentPath: __filename,
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

function whenInteractive() {
  if (performance.timing.domInteractive > 0) {
    const userTimingCategory = 'main.js',
      userTimingTime = performance.timing.domInteractive - performance.timing.navigationStart,
      userTimingVariableName = 'domInteractiveTime';

    track({hitType: 'timing', userTimingCategory, userTimingVariableName, userTimingTime});
  } else {
    setTimeout(whenInteractive, 500);
  }
}

(function () {
  whenInteractive();

  window.addEventListener('load', function () {
    const now = new Date().getTime(),
      userTimingCategory = 'main.js',
      userTimingTime = now - performance.timing.navigationStart,
      userTimingVariableName = 'load';

    track({hitType: 'timing', userTimingCategory, userTimingVariableName, userTimingTime});
  }, false);
}());

const rootEl = document.querySelector('main');

function render() {
  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>,
    rootEl
  );
}

(function () {
  try {
    render();
  } catch (ex) {
    track({hitType: 'exception', exceptionDescription: ex.message || ex.name, isExceptionFatal: false});
    local.clear();
    try {
      render();
    } catch (ex2) {
      track({hitType: 'exception', exceptionDescription: ex.message || ex.name, isExceptionFatal: true});
    }
  }

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
}());



