// import et initialisation des packages
const express = require("express");
const router = express.Router();
const isAuthenticated = require("../Middleware/isAuthenticated");
const cors = require("cors");
const cloudinary = require("cloudinary").v2;
const app = express();
app.use(cors());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// import du modèle Offer
const Offer = require("../Models/Offer");

// Création d'une route pour publier des offres SI l'utilisateur est authentifié !
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  // isAuthenticated est la fonction qui permet de checker l'authentification
  try {
    // console.log(req.files.picture.path);
    cloudinary.uploader.upload(req.files.picture.path, async (error, result) => {
      console.log(result.secure_url);
      const obj = {
        title: req.fields.title,
        description: req.fields.description,
        price: req.fields.price,
        // created: Date.now, // pas nécessaire vu qu'on a créé un default dans le modèle /!\
        picture: result.secure_url,
        creator: req.userToken
      };

      // if ( req.fields.title.length <= 50 && req.fields.description.length <= 500 && req.fields.price <= 100000) {
      // updaté dans le modèle Offer !!!!!!!
      const newOffer = new Offer(obj);

      await newOffer.save();

      res.json({
        _id: newOffer._id,
        title: newOffer.title,
        description: newOffer.description,
        price: newOffer.price,
        created: newOffer.created,
        picture: newOffer.picture,

        creator: {
          account: {
            username: newOffer.creator.account.username // ou  req.userToken.account.username
          },
          _id: newOffer.creator._id // ou  req.userToken._id
        }
      });

    });
    // console.log(req.userToken);

    // } else {
    //   res.json({ message: "Error, too many characters" });
    // }
  } catch (error) {
    res.json({ error: error.message });
  }
});

// création de la fonction qui va gérer les filtres
const filter = req => {
  const filters = {}; // => on veut retourner un objet à la fin
  if (req.query.priceMin) {
    // si il y a un prix min demandé
    filters.price = {}; // je crée une clé price vide
    filters.price.$gte = req.query.priceMin; // => méthode mongo $gte (greater than or equal) { price : { $gte: 10 } }
  }
  if (req.query.priceMax) {
    if (filters.price === undefined) {
      filters.price = {};
    }
    filters.price.$lte = req.query.priceMax;
  }
  if (req.query.title) {
    filters.title = new RegExp(req.query.title, "i"); // new RegExp permet de lancer une recherche de chaîne de caractère / "i" permet de rendre insensible à la casse
  }
  return filters; //on retourne les objets correspondant
};

router.get("/offer/with-count", async (req, res) => {
  try {
    const filteredResult = filter(req);
    // console.log(filteredResult);

    const search = Offer.find(filteredResult).populate("creator"); // on construit le processus de recherche

    // on construit les processus de tri par prix et/ou date
    if (req.query.sort === "price-asc") {
      search.sort({ price: 1 });
    } else if (req.query.sort === "price-desc") {
      search.sort({ price: -1 });
    }

    if (req.query.sort === "date-asc") {
      search.sort({ date: 1 });
    } else if (req.query.sort === "date-desc") {
      search.sort({ date: -1 });
    }

    if (req.query.page) {
      //
      const page = req.query.page;
      const limit = 10;
      search.limit(limit).skip(limit * (page - 1));
    }

    const results = await search;
    // console.log(results);
    let offers = [];
    results.forEach(result => {
      let newResult = {};
      newResult._id = result._id;
      newResult.title = result.title;
      newResult.description = result.description;
      newResult.price = result.price;
      newResult.username = result.creator.account.username;
      newResult.phone = result.creator.account.phone;
      newResult.date = result.created;
      newResult.creator_id = result.creator._id;
      offers.push(newResult);
    });
    let count = results.length;
    // console.log(offers);

    res.json({ count: count, offers });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// test 1

router.get("/offer/:id", async (req, res) => {
  try {
    const idSearch = await Offer.findById(req.params.id).populate("creator");
    res.json(idSearch);
  } catch (error) {
    res.json({ error: error.message });
  }
});

module.exports = router;
