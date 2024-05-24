const router = require("express").Router();

const { getDestinations } = require("../controllers/destinationController");
const { checkAuth } = require("../util/auth");

router.use(checkAuth);

router.get("/", getDestinations);

module.exports = router;
