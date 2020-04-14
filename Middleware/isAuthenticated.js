const User = require("../Models/User");

// on vérifie que l'utilisateur est connecté
const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    // si un token est "entré"
    const userToken = await User.findOne({
      token: req.headers.authorization.replace("Bearer ", "")
    });
    if (userToken) {
      // on vérifie qu'il appartient bien à un user,
      req.userToken = userToken; // on créer une nouvelle clé dans laquelle on enregistre le token
      next(); // on revient sur la route pour éxécuter la suite
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
