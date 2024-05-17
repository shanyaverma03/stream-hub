const router = require("express").Router();

const {
  getDestinations,
  addDestination,
} = require("../controllers/destinationController");

router.get("/:userId", getDestinations);

router.post("/add/:userId", addDestination);

module.exports = router;
