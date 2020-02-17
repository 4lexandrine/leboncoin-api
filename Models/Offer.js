// Création du modèle d'annonce

// Import de mongoose
const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  title: {
    type: String,
    minLength: 1,
    maxLength: 50,
    require: true
  },
  picture: {
    type: String
  },
  description: {
    type: String,
    minLength: 1,
    maxLength: 500,
    require: true
  },
  price: {
    type: String,
    min: 1,
    max: 100000,
    require: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = Offer;
