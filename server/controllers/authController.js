import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      regNo,
      department,
      year,
      section,
      role,
      hostelName,
    } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, error: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let advisorIds = [];
    let hodId = null;
    let wardenId = null;

    // --- ROLE: STUDENT ---
    if (role === "student") {
      const advisors = await User.find({
        role: "advisor",
        department,
        section
      }).limit(2);

      const hod = await User.findOne({
        role: "hod",
        department
      });

      advisorIds = advisors.map(a => a._id);
      hodId = hod ? hod._id : null;

      // removed automatic warden assignment
      wardenId = null;
    }

    // --- ROLE: ADVISOR ---
    else if (role === "advisor") {
      const hod = await User.findOne({
        role: "hod",
        department
      });

      const warden = await User.findOne({ role: "warden" });

      hodId = hod ? hod._id : null;
      wardenId = warden ? warden._id : null;
    }

    // --- ROLE: HOD ---
    else if (role === "hod") {
      const warden = await User.findOne({ role: "warden" });

      wardenId = warden ? warden._id : null;

      advisorIds = [];
      hodId = null;
    }

    // --- ROLE: WARDEN ---
    else if (role === "warden") {
      advisorIds = [];
      hodId = null;
      wardenId = null;
    }

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      regNo: role === "student" ? regNo : "",
      department,
      year: role === "student" ? year : "",
      section: role === "student" || role === "advisor" ? section : "",
      role,
      advisorId: advisorIds,
      hodId,
      wardenId,
      hostelName: role === "warden" ? hostelName : ""
    });

    await user.save();

    return res.json({
      success: true,
      message: `${role} registered successfully!`,
      user
    });

  } catch (err) {
    return res.json({ success: false, error: err.message });
  }
};

// Your login function is correct, no changes needed.
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    const check = await bcrypt.compare(password, user.password);
    if (!check)
      return res.status(401).json({ success: false, message: "Wrong password" });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        name: user.name,
        department: user.department,
        year: user.year,
        section: user.section,
        regNo: user.regNo,
      },
      process.env.JWT_SECRET
    );

    res.status(200).json({ success: true, token, role: user.role });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};