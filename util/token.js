const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    // 1 day
    { expiresIn: "24h" } // Token validity
  );
  return token;
};
const verifyToken = (req) => {
  const token = req.cookies.userToken;
  if (!token) return "";
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (err) {
    return "";
  }
};

// export the function
module.exports = {
  generateToken,
  verifyToken,
};
