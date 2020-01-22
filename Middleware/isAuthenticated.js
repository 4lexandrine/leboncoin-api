const User = require("../Models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const userToken = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", "")
    });
    if (userToken) {
      req.userToken = userToken;
      next();
    } else {
      res.json({ error: error.message });
    }
  }
};

module.exports = isAuthenticated;
