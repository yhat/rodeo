import bluebird from 'bluebird';

let pollInternal;

function replace(name) {
  return new bluebird(function (resolve, reject) {
    const oldThemeElList = document.querySelectorAll('#theme'),
      newTheme = document.createElement('link');

    newTheme.setAttribute('id', 'theme');
    newTheme.setAttribute('rel', 'stylesheet');
    newTheme.setAttribute('type', 'text/css');
    newTheme.setAttribute('href', 'themes/' + name + '.css');
    newTheme.addEventListener('load', () => {
      console.log('Loaded', name, 'theme');
      for (let i = 0; i < oldThemeElList.length; i++) {
        const el = oldThemeElList[i];

        el.parentNode.removeChild(el);
      }
      resolve();
      // poll(name);
    });
    newTheme.addEventListener('error', () => {
      const str = `Failed to load ${name} theme`;

      console.error(str);
      reject(new Error(str));
    });

    document.head.appendChild(newTheme);
  });
}

function poll(name) {
  if (pollInternal) {
    clearInterval(pollInternal);
    pollInternal = null;
  }

  pollInternal = setInterval(function () {
    replace(name);
  }, 3000);
}

export default {
  replace,
  poll
};
