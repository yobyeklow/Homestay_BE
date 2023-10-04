const router = require("express").Router();
const middlewareController = require("../controllers/middlewareController");
const listingController = require("../controllers/listingController");

router.post("/listing", listingController);

module.exports = router;
