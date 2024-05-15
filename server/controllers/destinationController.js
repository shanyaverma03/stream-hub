const bcrypt = require("bcrypt");

const User = require("../models/userModel");

module.exports.getDestinations = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("destinations");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.json({ destinations: user.destinations });
  } catch (error) {
    next(error);
  }
};
