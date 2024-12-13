const query = (...args) => {
  return new Promise((resolve, reject) => {
    db.query(...args, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = { query };
