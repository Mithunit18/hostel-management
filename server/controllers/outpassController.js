import Outpass from "../models/Outpass.js";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EmailUser,
    pass: process.env.EmailPass
  }
})

export const applyOutpass = async (req, res) => {
  try {
    const {
      studentId,
      name,
      department,
      year,
      semester,
      room,
      wardenId,
      outDate,
      outTime,
      inDate,
      inTime,
      reason
    } = req.body;

    const outpass = await Outpass.create({
      studentId,
      wardenId,
      name,
      department,
      year,
      semester,
      room,
      outDate,
      outTime,
      inDate,
      inTime,
      reason,
      approvalStatus: {
        advisor: "pending",
        hod: "pending",
        warden: "pending",
      }
    });

    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const studentData = await User.findOne(studentObjectId)

    if (studentData && studentData.advisorId.length > 0) {

      // Fetch all advisors whose _id is in advisorId array
      const advisors = await User.find({
        _id: { $in: studentData.advisorId }
      });

      const advisorEmails = advisors.map(a => a.email);

      const mail = {
        from: process.env.EmailUser,
        to: advisorEmails,
        subject: `New Outpass Application from ${name}`,
        html: `
      <h3>Outpass Request Details</h3>
      <p><strong>Student Name:</strong> ${name}</p>
      <p><strong>Reg No:</strong> ${studentData.regNo}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Leaving:</strong> ${outDate} at ${outTime}</p>
      <p><strong>Returning:</strong> ${inDate} at ${inTime}</p>
      <br/>
      <p>Please login to the portal to approve or reject this request.</p>
    `
      };

      await transporter.sendMail(mail);
      console.log("Advisor notified via email.");

    } else {
      console.log("Advisor email not found. Cannot send notification.");
    }


    res.json({ success: true, outpass, message: "Outpass applied successfully and advisor notified." });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};


export const getRequests = async (req, res) => {
  try {
    const { role } = req.params;

    let filter = {};

    if (role === "advisor") filter.status = "pending";
    else if (role === "hod") filter.status = "advisor-approved";
    else if (role === "warden") filter.status = "hod-approved";

    const reqs = await Outpass.find(filter).populate("studentId");

    res.json({ success: true, requests: reqs });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

export const approveOutpass = async (req, res) => {
  try {
    const { id, role } = req.body;

    let update = {};

    if (role === "advisor") update.status = "advisor-approved";
    else if (role === "hod") update.status = "hod-approved";
    else if (role === "warden") update.status = "warden-approved";

    await Outpass.findByIdAndUpdate(id, update);

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

export const getOutpassesByStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const outpasses = await Outpass.find({ studentId: id })
      .sort({ createdAt: -1 });

    res.json({ success: true, outpasses });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

export const cancelOutpass = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the outpass
    const outpass = await Outpass.findById(id);

    if (!outpass) {
      return res.json({ success: false, error: "Outpass not found." });
    }

    // Prevent cancellation of approved or rejected ones
    if (outpass.status === "approved") {
      return res.json({ success: false, error: "Approved outpass cannot be cancelled." });
    }

    if (outpass.status === "rejected") {
      return res.json({ success: false, error: "Rejected outpass cannot be cancelled." });
    }

    if (outpass.status === "cancelled") {
      return res.json({ success: false, error: "Request is already cancelled." });
    }

    // Update status
    outpass.status = "cancelled";
    await outpass.save();

    res.json({ success: true, message: "Outpass cancelled successfully." });

  } catch (error) {
    res.json({
      success: false,
      error: error.message || "Server error while cancelling outpass.",
    });
  }
};



