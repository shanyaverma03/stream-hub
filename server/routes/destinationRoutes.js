const router = require("express").Router();

const { getDestinations } = require("../controllers/destinationController");

router.get("/:id", getDestinations);

module.exports = router;
