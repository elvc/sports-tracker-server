const ordinalize = (numString) => {
  let ordinal = '';
  switch (numString) {
    case '1':
      ordinal = '1st';
      break;
    case '2':
      ordinal = '2nd';
      break;
    case '3':
      ordinal = '3rd';
      break;
    default:
      ordinal = `${numString}th`;
  }
  return ordinal;
};

module.exports = ordinalize;
