const router = require("express").Router();

const {
  register,
  login,
  validateInitialRequest,
} = require("../controllers/authController");
const { checkAuth } = require("../util/auth");

router.get("/validateInitialRequest", checkAuth, validateInitialRequest);

router.post("/register", register);
router.post("/login", login);
// router.post("/logout", logout);

module.exports = router;
