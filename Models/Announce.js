// Création du modèle d'annonce

// Import de mongoose
const mongoose = require("mongoose");

const Announce = mongoose.model("Announce", {
  title: String,
  description: String,
  price: Number,
  created: String,
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = Announce;
