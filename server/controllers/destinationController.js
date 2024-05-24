const bcrypt = require("bcrypt");

const User = require("../models/userModel");

module.exports.getDestinations = async (req, res, next) => {
  try {
    const { user } = req;
    res.status(200).json({ destinations: user.destinations });
  } catch (error) {
    next(error);
  }
};

module.exports.addDestination = async (req, res) => {
  const { channel, apiKey } = req.body;
  const hashedAPIKey = await bcrypt.hash(apiKey, 10);
  try {
    const { user } = req;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          destinations: { channel, apiKey: hashedAPIKey },
        },
      },
      { new: true }
    );

    res.status(201).json({ updatedDestinations: updatedUser.destinations });
  } catch (error) {
    console.error("Error adding destination", error);
    res.status(500).json({ message: "Server Error" });
  }
};
