/* globals describe, it, expect */

import lib from './color';

describe(__filename, function () {

  it('converts rgb to hsv, white', function () {
    const data = [255, 255, 255],
      result = [0, 0, 1];

    expect(lib.convertRGBToHSV(data)).toEqual(result);
  });

  it('converts rgb to hsv, black', function () {
    const data = [0, 0, 0],
      result = [0, 0, 0];

    expect(lib.convertRGBToHSV(data)).toEqual(result);
  });

  it('converts rgb to hsv, red', function () {
    const data = [255, 0, 0],
      result = [0, 1, 1];

    expect(lib.convertRGBToHSV(data)).toEqual(result);
  });

  it('converts rgb to hsv, blue', function () {
    const data = [0, 255, 255],
      result = [0.5, 1, 1];

    expect(lib.convertRGBToHSV(data)).toEqual(result);
  });

  it('converts hsv to rgb, white', function () {
    const data = [0, 0, 1],
      result = [255, 255, 255];

    expect(lib.convertHSVToRGB(data)).toEqual(result);
  });

  it('converts hsv to rgb, black', function () {
    const data = [0, 0, 0],
      result = [0, 0, 0];

    expect(lib.convertHSVToRGB(data)).toEqual(result);
  });

  it('converts hsv to rgb, red', function () {
    const data = [0, 1, 1],
      result = [255, 0, 0];

    expect(lib.convertHSVToRGB(data)).toEqual(result);
  });

  it('converts hsv to rgb, blue', function () {
    const data = [0.5, 1, 1],
      result = [0, 255, 255];

    expect(lib.convertHSVToRGB(data)).toEqual(result);
  });
});
