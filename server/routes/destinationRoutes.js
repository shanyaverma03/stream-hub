const router = require("express").Router();

const {
  addDestination,
  editDestination,
  deleteDestination,
} = require("../controllers/destinationController");
const { checkAuth } = require("../util/auth");

router.use(checkAuth);

router.post("/", addDestination);

router.put("/", editDestination);

router.delete("/", deleteDestination);

module.exports = router;
