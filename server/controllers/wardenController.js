import User from "../models/User.js";
import Outpass from "../models/Outpass.js";
import qrcode from "qrcode";
import crypto from "crypto";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { 
    user: process.env.EmailUser,
    pass: process.env.EmailPass
  }
});

export const getWardens = async (req, res) => {
    try {
        const user = await User.find({ role: "warden" });
        if (user.length === 0) {
            return res.status(404).json({ message: "No wardens found" });
        }
        res.status(200).json(user);
    } catch (error) {

    }
}
// ===== 2. Approve Outpass (Warden) =====
export const wardenApprove = async (req, res) => {
  try {
    const { id } = req.params; // This is the outpass _id
    const uniqueToken = crypto.randomBytes(16).toString("hex");

    const updated = await Outpass.findByIdAndUpdate(
      id,
      {
        // This is the FINAL approval
        status: "approved", 
        "approvalStatus.warden": "approved",
        qrToken: uniqueToken,
        gateStatus: "generated"
      },
      { new: true }
    );
    const pass = await Outpass.findById(id);
    console.log("pass:",pass);
    const qrCodeImage = await qrcode.toDataURL(uniqueToken);
    const studentData = await User.findOne(pass.studentId);
    console.log("studentData:",studentData);
    const studentEmail = studentData.email;
    
    const mailOptions = {
      from:process.env.EmailUser,
      to:studentEmail,
      subject:"Outpass Approved - Here is your Gate Pass",
      html: `
        <h3>Outpass Approved!</h3>
        <p>Your request has been approved by the Warden.</p>
        <p><strong>Valid For:</strong> ${pass.outDate} ${pass.outTime} to ${pass.inDate} ${pass.inTime}</p>
        <br/>
        <p><strong>Show this QR Code at the Gate:</strong></p>
        <img src="cid:unique-qrcode-id" alt="Gate Pass QR" width="200"/>
        <p>Safe travels!</p>
      `,
      attachments: [
        {
          filename: 'gatepass-qr.png',
          content: qrCodeImage.split("base64,")[1],
          encoding: 'base64',
          cid: 'unique-qrcode-id' // Same as in the html img src
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    console.log("QR Code sent to student :",studentEmail);

    res.json({ success: true, message: "Approved by Warden and QR Code sent mail", outpass: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ===== 3. Reject Outpass (Warden) =====
export const wardenReject = async (req, res) => {
  try {
    const { id } = req.params; // This is the outpass _id

    const updated = await Outpass.findByIdAndUpdate(
      id,
      {
        status: "rejected", // Rejection at any stage sets status to rejected
        "approvalStatus.warden": "rejected"
      },
      { new: true }
    );

    res.json({ success: true, message: "Rejected by Warden", outpass: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ===== 1. Get all pending outpasses for this warden (Corrected) =====
export const getWardenPending = async (req, res) => {
  try {
    const { wardenId } = req.params;

    // We can query Outpass directly since it has the wardenId
    const outpasses = await Outpass.find({
      wardenId: wardenId,          // CHANGED: Direct query
      status: "hod-approved",      // Must be approved by HOD
      "approvalStatus.warden": "pending" // And pending for warden
    }).populate("studentId", "name department year");

    res.json({ success: true, outpasses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ===== 4. Get history for this warden (Corrected) =====
export const getWardenHistory = async (req, res) => {
  try {
    const { wardenId } = req.params;

    // We can query Outpass directly
    const outpasses = await Outpass.find({
      wardenId: wardenId, // CHANGED: Direct query
      'approvalStatus.warden': { $in: ['approved', 'rejected'] }
    })
    .populate('studentId', 'name department year')
    .sort({ createdAt: -1 }); // Show newest first

    res.json({ success: true, outpasses });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};