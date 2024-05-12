const router = require("express").Router();

const {
  register,
  login,
  checkSession,
  logout,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/check-session", checkSession);

module.exports = router;
