// import et initialisation des packages
const express = require("express");
const router = express.Router();
const isAuthenticated = require("../Middleware/isAuthenticated");

// import du modèle Offer
const Offer = require("../Models/Offer");

// Création d'une route pour publier des offres SI l'utilisateur est authentifier !
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  // isAuthenticated est la fonction qui permet de checker l'authentification
  try {
    console.log(req.userToken);
    const newOffer = new Offer({
      title: req.fields.title,
      description: req.fields.description,
      price: req.fields.price,
      created: new Date(),
      creator: req.userToken
    });

    if (
      req.fields.title.length <= 50 &&
      req.fields.description.length <= 500 &&
      req.fields.price <= 100000
    ) {
      await newOffer.save();

      res.json({
        _id: newOffer._id,
        title: req.fields.title,
        description: req.fields.description,
        price: req.fields.price,
        created: newOffer.created,
        creator: {
          account: {
            username: req.userToken.account.username
          },
          _id: req.userToken._id
        }
      });
    } else {
      res.json({ message: "Error, too many characters" });
    }
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;
