// import et initialisation des packages
const express = require("express");
const stripe = require("stripe")(process.env.SECRET_STRIPE_KEY);
const router = express.Router();
const isAuthenticated = require("../Middleware/isAuthenticated");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const Offer = require("../Models/Offer");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  // isAuthenticated est la fonction qui permet de checker l'authentification
  try {

    cloudinary.uploader.upload(req.files.picture.path, async (error, result) => {

      const obj = {
        title: req.fields.title,
        description: req.fields.description,
        price: req.fields.price,
        picture: result.secure_url,
        creator: req.userToken
      };

      const newOffer = new Offer(obj);

      await newOffer.save();

      res.json({
        _id: newOffer._id,
        title: newOffer.title,
        description: newOffer.description,
        price: newOffer.price,
        created: newOffer.created,
        picture: result.secure_url,
        creator: {
          account: {
            username: newOffer.creator.account.username
          },
          _id: newOffer.creator._id
        }
      });

    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// création de la fonction qui va gérer les filtres
const createFilters = (req) => {
  const filters = {};
  if (req.query.priceMin) {
    filters.price = {};
    filters.price.$gte = req.query.priceMin;
  }
  if (req.query.priceMax) {
    if (filters.price === undefined) {
      filters.price = {};
    }
    filters.price.$lte = req.query.priceMax;
  }

  if (req.query.title) {
    filters.title = new RegExp(req.query.title, "i");
  }
  return filters;
};

router.get("/offer/with-count", async (req, res) => {
  try {
    const totalOffers = await Offer.find();
    let count = totalOffers.length;

    const filters = createFilters(req);
    const search = Offer.find(filters);

    if (req.query.sort === "price-asc") {
      search.sort({ price: 1 });
    } else if (req.query.sort === "price-desc") {
      search.sort({ price: -1 });
    }
    if (req.query.page) {
      const page = req.query.page;
      const limit = 5;
      search.limit(limit).skip(limit * (page - 1));
    }
    const offers = await search.populate({
      path: "creator",
      select: "account",
    });

    res.json({ count, offers: offers });
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const offer = await Offer.findById(id).populate({
      path: "creator",
      select: "account",
    });
    const userId = offer.creator._id;
    const countOffers = await Offer.find({ creator: userId });
    res.json({ offer: offer, count: countOffers.length });
  } catch (error) {
    res.json({ message: error.message });
  }
});

router.post("/payment", async (req, res) => {
  try {
    let response = await stripe.charges.create({
      amount: `${req.fields.price}00`,
      currency: "eur",
      description: req.fields.title,
      source: req.fields.token
    })
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

router.post("/search", async (req, res) => {
  try {
    const search = await Offer.find({ title: { $regex: req.fields.search, $options: 'i' } });
    res.json({ search })
  } catch (error) {
    res.json({ message: error.message });
  }
})

module.exports = router;
