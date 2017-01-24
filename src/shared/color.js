import _ from 'lodash';

/**
 * @param {Array} rgb
 * @returns {Array}
 */
function convertRGBToHSV(rgb) {
  const min = _.min(rgb),
    max = _.max(rgb),
    del = max - min,
    value = max / 255,
    [r, g, b] = rgb;
  let hue, saturation;

  if (del === 0) {
    hue = 0;
    saturation = 0;
  } else {
    saturation = del / max;
    let delR = (((max - r) / 6 ) + (del / 2)) / del,
      delG = (((max - g) / 6 ) + (del / 2)) / del,
      delB = (((max - b) / 6 ) + (del / 2)) / del;

    if (r === max) {
      hue = delB - delG;
    } else if (g === max) {
      hue = (1 / 3) + delR - delB;
    } else if (b === max) {
      hue = (2 / 3) + delG - delR;
    }

    if (hue < 0) {
      hue += 1;
    } else if (hue > 1) {
      hue -= 1;
    }
  }

  return [hue, saturation, value];
}

/**
 * @param {Array} hsv
 * @returns {Array}
 */
function convertHSVToRGB(hsv) {
  let i, v1, v2, v3, rgb,
    [hue, saturation, value] = hsv;

  if (hue === 1) {
    hue = 0;
  }

  hue = hue * 6;
  i = Math.floor(hue);
  v1 = value * (1 - saturation);
  v2 = value * (1 - saturation * (hue - i));
  v3 = value * (1 - saturation * (1 - (hue - i)));

  if (i === 0) {
    rgb = [value, v3, v1];
  } else if (i === 1) {
    rgb = [v2, value, v1];
  } else if (i === 2) {
    rgb = [v1, value, v3];
  } else if (i === 3) {
    rgb = [v1, v2, value];
  } else if (i === 4) {
    rgb = [v3, v1, value];
  } else {
    rgb = [value, v1, v3];
  }

  rgb = rgb.map(x => Math.ceil(x * 255));

  return rgb;
}

export default {
  convertRGBToHSV,
  convertHSVToRGB
};
