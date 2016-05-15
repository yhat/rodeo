import _ from 'lodash';

const email = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

export function isEmail(value) {
  return email.test(value);
}

export function isFontSize(value) {
  // for now, must end with 'px', 'em', or 'rem'

  if (!(_.endsWith(value, 'px') || _.endsWith(value, 'em') || _.endsWith(value, 'rem'))) {
    return false;
  }

  try {
    let numValue = parseFloat(value);

    return numValue > 6 && numValue < 86;
  } catch (ex) {
    console.warn('Font size is not a valid number: ' + value);
    return false;
  }
}

export function isTabSpace(value) {
  try {
    let numValue = parseInt(value, 10);

    // from 0 to 8, and there are no extra values mixed in, i.e., letters or units.
    return numValue >= 0 && numValue <= 8 && numValue.toString() === value;
  } catch (ex) {
    console.warn('Font size is not a valid number: ' + value);
    return false;
  }
}

export default {
  isEmail,
  isFontSize,
  isTabSpace
};
