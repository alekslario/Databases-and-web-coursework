const len = (str, min, max) => {
  return str.length >= min && str.length <= max;
};

module.exports = { len };
