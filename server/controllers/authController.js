const bcrypt = require("bcrypt");

const User = require("../models/userModel");

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });

    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already exists", status: false });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;

    req.session.isLoggedIn = true;
    req.session.user = user._id;

    return res.json({ status: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    delete user.password;

    req.session.isLoggedIn = true;
    req.session.user = { id: user._id, username: user.username };

    return res.json({
      status: true,
      user: { id: user._id, username: user.username },
    });
  } catch (error) {
    next(error);
  }
};

module.exports.checkSession = (req, res, next) => {
  if (req.session.isLoggedIn) {
    return res.json({
      isLoggedIn: true,
      user: req.session.user,
    });
  } else {
    return res.json({
      isLoggedIn: false,
    });
  }
};

module.exports.logout = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.clearCookie("connect.sid");
    res.json({ status: true, msg: "Logged out successfully" });
  });
};
