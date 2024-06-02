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

  try {
    const { user } = req;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          destinations: { channel, apiKey },
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

module.exports.editDestination = async (req, res) => {
  const { channel, apiKey } = req.body;

  try {
    const { user } = req;
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, "destinations.channel": channel },
      {
        $set: {
          "destinations.$.apiKey": apiKey,
        },
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "Destination not found" });
    }
    res.status(200).json({ updatedDestinations: updatedUser.destinations });
  } catch (error) {
    console.error("Error editing destination", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.deleteDestination = async (req, res) => {
  const { channel } = req.query;

  try {
    const { user } = req;
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $pull: { destinations: { channel } },
      },
      { new: true }
    );
    if (updatedUser) {
      res.status(200).json({ updatedDestinations: updatedUser.destinations });
    } else {
      res
        .status(404)
        .json({ message: "User not found or destination not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
