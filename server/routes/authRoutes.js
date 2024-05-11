const router = require("express").Router();

const {
  register,
  login,
  checkSession,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

router.get("/check-session", checkSession);

module.exports = router;
