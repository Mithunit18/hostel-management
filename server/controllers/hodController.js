import Outpass from "../models/Outpass.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv"

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EmailUser,
    pass: process.env.EmailPass
  }
})

// --- 1. Get Pending Requests ---
// Finds students, THEN finds their 'advisor-approved' outpasses.
export const getHodPending = async (req, res) => {
  try {
    const { hodId } = req.params;

    // 1. Find all students who are mapped to this HOD
    const students = await User.find({ hodId: hodId }).select("_id");
    const studentIds = students.map(s => s._id);

    // 2. Find all outpasses for these students
    //    that are in the 'advisor-approved' state
    const outpasses = await Outpass.find({
      studentId: { $in: studentIds },
      status: 'advisor-approved' // <-- Key difference!
    })
      .populate('studentId', 'name department year')
      .sort({ createdAt: 1 }); // Show oldest first

    res.json({ success: true, outpasses });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// --- 2. Get History ---
// Finds students, THEN finds outpasses the HOD already acted on.
export const getHodHistory = async (req, res) => {
  try {
    const { hodId } = req.params;

    // 1. Find all students mapped to this HOD
    const students = await User.find({ hodId: hodId }).select("_id");
    const studentIds = students.map(s => s._id);

    // 2. Find all outpasses for these students
    //    where the HOD status is 'approved' or 'rejected'
    const outpasses = await Outpass.find({
      studentId: { $in: studentIds },
      'approvalStatus.hod': { $in: ['approved', 'rejected'] }
    })
      .populate('studentId', 'name department year')
      .sort({ createdAt: -1 }); // Show newest first

    res.json({ success: true, outpasses });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// --- 3. Approve Request ---
// Finds the single outpass by its ID and updates it.
export const hodApprove = async (req, res) => {
  try {
    const { id } = req.params; // This 'id' is the Outpass _id

    const updatedOutpass = await Outpass.findByIdAndUpdate(
      id,
      {
        status: 'hod-approved', // Move to the next step (Warden)
        'approvalStatus.hod': 'approved'
      },
      { new: true } // Return the updated document
    );

    const data = await Outpass.findById(id); // fresh outpasss

    const studentData = await User.findOne(data.studentId);


    if (!data.wardenId) {
      return res.json({ success: false, error: "Student not found" });
    }

    // 3. Fetch HOD
    const wardenData = await User.findById(data.wardenId);

    if (!wardenData) {
      return res.json({ success: false, error: "Warden not found" });
    }

    // 4. HOD Email
    const mail = {
      from: process.env.EmailUser,
      to: wardenData.email,
      subject: `Outpass Approval Required - ${studentData.name}`,
      html: `
            <h3>Outpass Request Requires Your Approval</h3>
            <p><strong>Student Name:</strong> ${studentData.name}</p>
            <p><strong>Reg No:</strong> ${studentData.regNo}</p>
    
            <p><strong>Reason:</strong> ${data.reason}</p>
            <p><strong>Leaving:</strong> ${data.outDate} at ${data.outTime}</p>
            <p><strong>Returning:</strong> ${data.inDate} at ${data.inTime}</p>
    
            <br/>
            <p>The HOD has approved this Outpass.</p>
            <p>Please login to the portal to approve or reject this request.</p>
          `
    };

    await transporter.sendMail(mail);
    console.log("Warden notified via email:", wardenData.email);

    res.json({ success: true, message: "Approved by HOD & Warden notified",outpass: updatedOutpass });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// --- 4. Reject Request ---
// Finds the single outpass by its ID and marks it rejected.
export const hodReject = async (req, res) => {
  try {
    const { id } = req.params; // This 'id' is the Outpass _id

    const updatedOutpass = await Outpass.findByIdAndUpdate(
      id,
      {
        status: 'rejected', // The process stops here
        'approvalStatus.hod': 'rejected'
      },
      { new: true }
    );

    res.json({ success: true, outpass: updatedOutpass });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};