import Outpass from "../models/Outpass.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EmailUser,
    pass: process.env.EmailPass
  }
})

// ===== 1. Get all pending outpasses for this advisor =====
export const getAdvisorPending = async (req, res) => {
  try {
    const advisorId = req.params.advisorId;

    // find students under this advisor
    const students = await User.find({ advisorId: advisorId }).select("_id");

    const outpasses = await Outpass.find({
      studentId: { $in: students.map(s => s._id) },
      "approvalStatus.advisor": "pending",
      status: "pending"
    }).populate("studentId", "name department year");

    res.status(200).json({ success: true, outpasses });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ===== 2. Approve Outpass =====
export const advisorApprove = async (req, res) => {
  try {
    const id = req.params.id;

    // 1. Update Outpass
    const updated = await Outpass.findByIdAndUpdate(
      id,
      {
        status: "advisor-approved",
        "approvalStatus.advisor": "approved"
      },
      { new: true }
    );

    const data = await Outpass.findById(id); // fresh outpass

    // 2. Fetch student via studentId stored in Outpass
    const studentData = await User.findOne(data.studentId);

    if (!studentData) {
      return res.json({ success: false, error: "Student not found" });
    }

    // 3. Fetch HOD
    const hodData = await User.findById(studentData.hodId);

    if (!hodData) {
      return res.json({ success: false, error: "HOD not found" });
    }

    // 4. HOD Email
    const mail = {
      from: process.env.EmailUser,
      to: hodData.email,
      subject: `Outpass Approval Required - ${studentData.name}`,
      html: `
        <h3>Outpass Request Requires Your Approval</h3>
        <p><strong>Student Name:</strong> ${studentData.name}</p>
        <p><strong>Reg No:</strong> ${studentData.regNo}</p>

        <p><strong>Reason:</strong> ${data.reason}</p>
        <p><strong>Leaving:</strong> ${data.outDate} at ${data.outTime}</p>
        <p><strong>Returning:</strong> ${data.inDate} at ${data.inTime}</p>

        <br/>
        <p>The Advisor has approved this Outpass.</p>
        <p>Please login to the portal to approve or reject this request.</p>
      `
    };

    await transporter.sendMail(mail);
    console.log("HOD notified via email:", hodData.email);

    res.json({ success: true, message: "Approved by Advisor & HOD notified", outpass: updated });

  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};


// ===== 3. Reject Outpass =====
export const advisorReject = async (req, res) => {
  try {
    const id = req.params.id;

    const updated = await Outpass.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        "approvalStatus.advisor": "rejected"
      },
      { new: true }
    );

    res.json({ success: true, message: "Rejected by Advisor", outpass: updated });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
};

export const getAdvisorHistory = async (req, res) => {
  try {
    const { advisorId } = req.params;

    // 1. Find all students who are mapped to this advisor
    const students = await User.find({ advisorId: advisorId }).select("_id");
    const studentIds = students.map(s => s._id);

    // 2. Find all outpasses for these students
    //    where the advisor status is 'approved' or 'rejected'
    const outpasses = await Outpass.find({
      studentId: { $in: studentIds },
      'approvalStatus.advisor': { $in: ['approved', 'rejected'] }
    })
      .populate('studentId', 'name department year')
      .sort({ createdAt: -1 }); // Show newest first

    res.json({ success: true, outpasses });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
