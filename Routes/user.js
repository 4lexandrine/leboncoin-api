// import et initialisation des packages
const express = require("express");
const router = express.Router();
const cors = require("cors");
app.use(cors());


const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

// import du modèle User
const User = require("../Models/User");

router.post("/user/sign_up", async (req, res) => {
  try {
    const salt = uid2(64); // chaine de 64 caracteres
    // console.log(salt);
    const hash = SHA256(req.fields.password + salt).toString(encBase64); // mélange du salt + password encrypté qui renvoie un tableau qu'on retransforme en chaîne de caractere (dans le modèle User hash doit être de type String)
    // console.log(hash);
    const token = uid2(64); // chaîne de 64 caracteres (qui vva servir pour les cookies)
    // console.log(token);

    // création d'un nouvel utilisateur
    const newUser = new User({
      email: req.fields.email,
      token: token,
      salt: salt,
      hash: hash,
      account: {
        phone: req.fields.phone,
        username: req.fields.username
      }
    });
    const user = await User.findOne({ email: req.fields.email });
    if (!user) {
      // remplacé dans le modèle par unique: true
      // si cet utilisateur n'existe pas déjà, on le sauvegarde dans la bdd
      // if (!newUser.username) {
      // obligation de choisir un username
      // res.json({ error: "You have to choose a username" });
      // } else {
      await newUser.save();

      res.json({
        _id: newUser._id,
        token: newUser.token,
        account: {
          username: newUser.account.username,
          phone: newUser.account.phone
        }
      });
    } else {
      res.json({ error: "This user already exists" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

router.post("/user/log_in", async (req, res) => {
  try {
    // on cherche si l'email entré par l'utilisateur est enregistré dans la bdd
    const user = await User.findOne({ email: req.fields.email });

    if (user) {
      // si il est dans la bdd
      if (
        // si le password mentionné par le user + son salt(sauvegardé dans la bdd) === son hash (sauvegardé dans la bdd)
        SHA256(req.fields.password + user.salt).toString(encBase64) ===
        user.hash
      ) {
        res.json({
          message: "Authentification réussie",
          _id: user._id,
          token: user.token,
          username: user.account.username,
          phone: user.account.phone
        });
      } else {
        res.status(401).json({ error: "Unauthorized" }); // si le mot de passe entré n'est pas le bon
      }
    } else {
      res.status(400).json({ error: "User not found" }); // si le mail n'est pas trouvé dans la bdd
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router; // exporte le document
