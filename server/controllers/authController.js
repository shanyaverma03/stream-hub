const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("../models/userModel");
const { createJSONToken } = require("../util/auth");
const { isValidEmail, isValidText } = require("../util/validation");
const Blacklist = require("../models/blacklist");

module.exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  if (!isValidText(username, 3)) {
    return res.status(422).send("Invalid username!");
  } else {
    try {
      const usernameCheck = await User.findOne({ username });
      if (usernameCheck) {
        return res.status(422).send("Username already exists!");
      }
    } catch (err) {
      console.log(err);
    }
  }

  if (!isValidEmail(email)) {
    return res.status(422).send("Invalid email!");
  } else {
    try {
      const emailCheck = await User.findOne({ email });
      if (emailCheck) {
        return res.status(422).send("Email already exists!");
      }
    } catch (err) {
      console.log(err);
    }
  }

  if (!isValidText(password, 8)) {
    return res.status(422).send("Invalid password. Must be min 8 char long!");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      destinations: [],
    });
    delete user.password;

    const authToken = createJSONToken(user.username);
    res.status(201).json({
      message: "User created.",
      user: { userId: user._id, username: user.username },
      token: authToken,
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).send("Authentication failed.");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.status(422).send("Invalid email or password!");
    delete user.password;

    const token = createJSONToken(username);
    res.json({
      user: { userId: user._id, username: user.username },
      token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.validateInitialRequest = async (req, res, next) => {
  res.status(200).send("ok");
};

module.exports.logout = async (req, res, next) => {
  const { token } = req;
  const newBlackList = new Blacklist({
    token,
  });

  try {
    await newBlackList.save();
    console.log("added to blacklist");
    res.status(200).send("Logged out successfully");
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
};
