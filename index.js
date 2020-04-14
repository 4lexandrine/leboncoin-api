const express = require("express");
const mongoose = require("mongoose");
const formidableMiddleware = require("express-formidable");
const cors = require("cors");

require('dotenv').config();

const app = express();
app.use(formidableMiddleware({ multiples: true }));
app.use(cors());

const userRoutes = require("./Routes/user");
app.use(userRoutes);
const offerRoutes = require("./Routes/offer");
app.use(offerRoutes);


// Création de la bdd
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Leboncoin API" });
});

app.all("*", () => {
  console.log("All routes");
});

app.listen(process.env.PORT || 3100, () => {
  console.log("Server Started");
});
