// Création du modèle utilisateur

// import de mongoose
const mongoose = require("mongoose");

//création du modèle User dans la collection users ("User" en minuscule et pluriel) de mongodb
const User = mongoose.model("User", {
  email: { type: String, unique: true },
  token: String,
  salt: String,
  hash: String,
  account: {
    username: { type: String, required: true },
    phone: { type: String }
  }
});

// export du modèle
module.exports = User;
