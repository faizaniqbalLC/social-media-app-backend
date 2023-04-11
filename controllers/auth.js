import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/** REGISTER USER */
export const register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "Invalid Email Address!" });
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
      picturePath,
      friends,
      location,
      occupation,
      viewedProfile: Math.floor(Math.random() * 10000),
      impressions: Math.floor(Math.random() * 10000),
    });

    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error Registering User.",
    });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials!" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    delete user.password;

    await user.save();
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      picturePath: user.picturePath,
      friends: user.friends,
      location: user.location,
      occupation: user.occupation,
      viewedProfile: user.viewedProfile,
      impressions: user.impressions,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      __v: user.__v,
    };
    console.log({ userData });
    res
      .status(200)
      .json({ token, user: userData, msg: "Logged In Successfully." });
  } catch (error) {
    res.status(500).json({
      error: error.message || "Error while logging in.",
    });
  }
};
