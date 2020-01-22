// Import des packages qui vont être utilisées
const express = require("express");
const mongoose = require("mongoose");
const formidableMiddleware = require("express-formidable");

// initialisation
const app = express();
app.use(formidableMiddleware());

// Création du lien avec le document /Routes/user
const userRoutes = require("./Routes/user");
app.use(userRoutes);
const offerRoutes = require("./Routes/offer");
app.use(offerRoutes);

// Création de la bdd
mongoose.connect("mongodb://localhost/leboncoin", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

app.all("*", () => {
  console.log("All routes");
});

app.listen(3000, () => {
  console.log("Server Started");
});
