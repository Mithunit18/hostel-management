import Outpass from "../models/Outpass.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure Email
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
    user: process.env.EmailUser,
    pass: process.env.EmailPass,
  },
});

export const verifyGatePass = async (req, res) => {
  try {
    const { qrToken } = req.body; // The token from the scanned QR

    // 1. Find Outpass by Token
    const outpass = await Outpass.findOne({ qrToken }).populate('studentId wardenId');

    if (!outpass) {
      return res.status(404).json({ success: false, message: "Invalid QR Code" });
    }

    // 2. Check Logic based on Current Status
    if (outpass.status !== "approved" && outpass.gateStatus !== "exited") {
      // We allow 'exited' status to pass this check so they can scan back in
      return res.status(400).json({ success: false, message: "This Outpass is not active or was rejected." });
    }

    const now = new Date();

    // --- SCENARIO A: STUDENT IS LEAVING (First Scan) ---
    if (outpass.gateStatus === "generated") {
      outpass.gateStatus = "exited";
      outpass.actualOutTime = now;
      await outpass.save();

      return res.json({ 
        success: true, 
        type: "EXIT", 
        message: "Exit Approved. Safe Journey!",
        student: outpass.studentId.name 
      });
    }

    // --- SCENARIO B: STUDENT IS RETURNING (Second Scan) ---
    else if (outpass.gateStatus === "exited") {
      
      // Construct scheduled in-time date object
      // Assuming outpass.inDate is YYYY-MM-DD and inTime is HH:MM
      const scheduleIn = new Date(`${outpass.inDate}T${outpass.inTime}:00`);
      
      // Mark as returned
      outpass.gateStatus = "returned";
      outpass.actualInTime = now;
      
      // Permanently Invalidate QR (use undefined so sparse index ignores it)
      outpass.qrToken = undefined; 
      outpass.status = "completed"; 
      await outpass.save();

      // Check if they are late
      if (now > scheduleIn) {
        
        // Send Email to Warden
        if(outpass.wardenId && outpass.wardenId.email) {
          const wardenEmail = outpass.wardenId.email;
          
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: wardenEmail,
            subject: `LATE RETURN ALERT: ${outpass.studentId.name}`,
            html: `
              <div style="border: 2px solid red; padding: 20px; color: red;">
                <h3>⚠️ Late Return Alert</h3>
                <p>Student <strong>${outpass.studentId.name}</strong> has returned late.</p>
                <p><strong>Scheduled:</strong> ${outpass.inDate} ${outpass.inTime}</p>
                <p><strong>Actual:</strong> ${now.toLocaleString()}</p>
              </div>
            `
          };
          // Send email without blocking
          transporter.sendMail(mailOptions).catch(e => console.log(e));
          console.log(`Late alert sent to Warden: ${wardenEmail}`);
        }
        
        return res.json({ 
          success: true, 
          type: "ENTRY", 
          warning: "Student is Late. Warden Notified.", 
          message: "Entry Recorded (LATE)." 
        });
      }

      return res.json({ 
        success: true, 
        type: "ENTRY", 
        message: "Welcome Back! Entry Recorded." 
      });
    }

    // --- SCENARIO C: ALREADY USED ---
    else {
      return res.status(400).json({ 
        success: false, 
        message: "This QR Code has already been used and is now INVALID." 
      });
    }

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
