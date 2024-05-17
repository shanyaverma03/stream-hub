const bcrypt = require("bcrypt");

const User = require("../models/userModel");

module.exports.getDestinations = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("destinations");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.json({ destinations: user.destinations });
  } catch (error) {
    next(error);
  }
};

exports.addDestination = async (req, res) => {
  const { userId, channel, apiKey } = req.body;
  const hashedAPIKey = await bcrypt.hash(apiKey, 10);
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          destinations: { channel, apiKey: hashedAPIKey },
        },
      },
      { new: true }
    );
    console.log("done");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error adding destination", error);
    res.status(500).json({ message: "Server Error" });
  }
};
