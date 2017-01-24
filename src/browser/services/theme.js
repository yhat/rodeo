import _ from 'lodash';
import bluebird from 'bluebird';

let pollInternal;

/**
 * Converts from a number like 15 to a two-digit hex string like '0F'
 * @param {number} num
 * @returns {string}  Always at least two digits
 * @private
 */
function toHexString(num) {
  let str = num.toString(16);

  if (str.length < 2) {
    str = '0' + str;
  }

  return str;
}

/**
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 * @param {object} colors
 * @private
 */
function setStyleColor(red, green, blue, colors) {
  const c = 16 + (red * 36) + (green * 6) + blue,
    r = red > 0 ? red * 40 + 55 : 0,
    g = green > 0 ? green * 40 + 55 : 0,
    b = blue > 0 ? blue * 40 + 55 : 0;

  let rgbVector = [r, g, b],
    results = [];

  for (let i = 0; i < 3; i++) {
    results.push(toHexString(rgbVector[i]));
  }

  colors[c] = '#' + results.join('');
}

function getANSIDefaultColors() {
  const colors = {
    0: '#000',
    1: '#A00',
    2: '#0A0',
    3: '#A50',
    4: '#00A',
    5: '#A0A',
    6: '#0AA',
    7: '#AAA',
    8: '#555',
    9: '#F55',
    10: '#5F5',
    11: '#FF5',
    12: '#55F',
    13: '#F5F',
    14: '#5FF',
    15: '#FFF'
  };

  _.range(0, 5).forEach(red => {
    _.range(0, 5).forEach(green => {
      _.range(0, 5).forEach(blue => setStyleColor(red, green, blue, colors));
    });
  });

  _.range(0, 23).forEach(function (gray) {
    const c = gray + 232,
      l = toHexString(gray * 10 + 8);

    colors[c] = '#' + l + l + l;
  });

  return colors;
}

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

function convertHexColorCodeToRGBVector(hexCode) {
  if (hexCode[0] === '#') {
    hexCode = hexCode.substr(1);
  }

  if (hexCode.length === 3) {
    hexCode = _.map(hexCode, x => x + x).join('');
  }

  if (hexCode.length !== 6) {
    throw new TypeError('Invalid HexColorCode');
  }

  let rbgVector = [];

  for (let i = 0; i < 3; i++) {
    rbgVector.push(parseInt(hexCode.substr(0, 2), 16));
    hexCode = hexCode.substr(2);
  }

  return rbgVector;
}

/**
 * @param {string} backgroundHexCode
 */
function getANSIColors(backgroundHexCode) {
  let backgroundRBG = convertHexColorCodeToRGBVector(),
    backgroundSum = _.sum(backgroundRBG),
    isDark = backgroundSum < 255 * 3 / 2,
    ansiDefaultColors = getANSIDefaultColors();

  if (isDark) {
    // shift brighter
    ansiDefaultColors = _.mapValues(ansiDefaultColors, value => {

    });
  } else {
    // shift darker
  }

  return ansiDefaultColors;
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
  convertHexColorCodeToRGBVector,
  getANSIColors,
  poll,
  getANSIDefaultColors
};
