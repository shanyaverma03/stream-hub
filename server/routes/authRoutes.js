const router = require("express").Router();

const {
  register,
  login,
  validateInitialRequest,
  logout,
} = require("../controllers/authController");
const { checkAuth } = require("../util/auth");

router.get("/validateInitialRequest", checkAuth, validateInitialRequest);

router.post("/register", register);
router.post("/login", login);
router.post("/logout", checkAuth, logout);

module.exports = router;
