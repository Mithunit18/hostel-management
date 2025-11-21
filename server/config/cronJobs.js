import cron from 'node-cron';
import Outpass from '../models/Outpass.js'; // Adjust path
import nodemailer from 'nodemailer';

// Reuse your transporter
const transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
    user: process.env.EmailUser, 
    pass: process.env.EmailPass },
});

const checkOverdueOutpasses = async () => {
  console.log("--- Running Overdue Check ---");
  
  try {
    // 1. Find all students who are currently OUT ('exited')
    // We populate warden details to send the email, and student details for the message
    const activeOutpasses = await Outpass.find({ gateStatus: "exited" })
      .populate('wardenId')
      .populate('studentId');

    const now = new Date();

    for (const outpass of activeOutpasses) {
      // 2. Construct the Deadline Date Object
      // Assuming format: inDate="2025-11-18", inTime="18:30"
      // Note: Ensure your frontend sends time in 24h format (HH:MM)
      const deadlineString = `${outpass.inDate}T${outpass.inTime}:00`; 
      const deadline = new Date(deadlineString);

      // 3. Compare Time
      if (now > deadline) {
        console.log(`VIOLATION FOUND: ${outpass.studentId.name} is late.`);

        // 4. Invalidate QR Code & Update Status
        outpass.gateStatus = "expired"; // Or "violation"
        outpass.qrToken = null; // PERMANENTLY INVALIDATE QR
        outpass.status = "cancelled"; // Mark logic as closed/failed
        await outpass.save();

        // 5. Notify Warden
        if (outpass.wardenId && outpass.wardenId.email) {
          const mailOptions = {
            from: process.env.EmailUser,
            to: outpass.wardenId.email,
            subject: `ALERT: Student Missing / Late Return - ${outpass.studentId.name}`,
            html: `
              <div style="color: red; border: 2px solid red; padding: 20px;">
                <h3>⚠️ SECURITY ALERT: LATE RETURN</h3>
                <p>The following student has failed to scan their return QR code by the deadline.</p>
                <hr/>
                <p><strong>Student:</strong> ${outpass.studentId.name} (${outpass.studentId.regNo})</p>
                <p><strong>Hostel:</strong> ${outpass.hostelName}</p>
                <p><strong>Expected Return:</strong> ${outpass.inDate} at ${outpass.inTime}</p>
                <p><strong>Current Status:</strong> Mark as VIOLATION / EXPIRED</p>
                <hr/>
                <p>The QR Code for this outpass has been permanently disabled.</p>
              </div>
            `
          };
          
          await transporter.sendMail(mailOptions);
          console.log(`Alert sent to Warden: ${outpass.wardenId.email}`);
        }
      }
    }
  } catch (err) {
    console.error("Cron Job Error:", err);
  }
};

// Schedule the task
// "*/30 * * * *" means run every 30 minutes.
// You can change it to "0 * * * *" to run every hour.
export const startCronJob = () => {
  cron.schedule('*/30 * * * *', checkOverdueOutpasses);
  console.log("🕒 Overdue Check Scheduler Started...");
};