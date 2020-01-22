const User = require("../Models/User");

// on vérifie que l'utilisateur est connecté
// req, res, next => viennent de express, next permet de passer à la suite, de revenir sur la route
const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    // si un token est "entré"
    const userToken = await User.findOne({
      // alors on lui enlève le début "Bearer " et on l'attribut à une constante
      token: req.headers.authorization.replace("Bearer ", "")
    });
    if (userToken) {
      // on vérifie qu'elle appartient bien à un user,
      req.userToken = userToken; // on créé une nouvelle clé dans laquelle on enregistre le token
      next(); // on revient sur la route pour éxécuter la suite
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
