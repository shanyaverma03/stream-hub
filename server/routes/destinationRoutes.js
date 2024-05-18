const router = require("express").Router();

const {
  getDestinations,
  addDestination,
} = require("../controllers/destinationController");
const { checkAuth } = require("../util/auth");

router.use(checkAuth);

router.get("/:userId", getDestinations);

router.post("/add/:userId", addDestination);

module.exports = router;
