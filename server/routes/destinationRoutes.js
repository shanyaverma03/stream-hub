const router = require("express").Router();

const { addDestination } = require("../controllers/destinationController");
const { checkAuth } = require("../util/auth");

router.use(checkAuth);

router.post("/", addDestination);

module.exports = router;
