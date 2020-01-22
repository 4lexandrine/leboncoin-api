// import et initialisation des packages
const express = require("express");
const router = express.Router();
const isAuthenticated = require("../Middleware/isAuthenticated");

// import du modèle User
const Offer = require("../Models/Offer");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    console.log(req.userToken);
    const newOffer = new Offer({
      title: req.fields.title,
      description: req.fields.description,
      price: req.fields.price,
      created: new Date(),
      creator: req.userToken
    });

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
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;
