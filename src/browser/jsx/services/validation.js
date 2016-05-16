const email = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

export function isEmail(value) {
  return email.test(value);
}

export function isFontSize(value) {
  try {
    let numValue = parseInt(value, 10);

    // from 0 to 8, and there are no extra values mixed in, i.e., letters or units.
    return numValue >= 6 && numValue <= 86 && numValue.toString() === value;
  } catch (ex) {
    return false;
  }
}

export function isTabSpace(value) {
  try {
    let numValue = parseInt(value, 10);

    // from 0 to 8, and there are no extra values mixed in, i.e., letters or units.
    return numValue >= 0 && numValue <= 8 && numValue.toString() === value;
  } catch (ex) {
    return false;
  }
}

export default {
  isEmail,
  isFontSize,
  isTabSpace
};
