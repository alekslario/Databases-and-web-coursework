const bcrypt = require("bcrypt");
const saltRounds = 10;

// export the function
module.exports = {
  hashPassword: async function (plainPassword, callback) {
    return bcrypt.hash(plainPassword, saltRounds, callback);
  },
};
