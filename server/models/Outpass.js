import mongoose from "mongoose";

const outpassSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  wardenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  name: String,
  department: String,
  year: String,
  semester: String,
  room: String,
  hostelName: String, // --- ADDED ---
  wardenName: String, // --- ADDED ---

  outDate: String,
  outTime: String,
  inDate: String,
  inTime: String,

  reason: String,

  status: {
    type: String,
    enum: [
      "pending",
      "advisor-approved",
      "hod-approved",
      "approved", // final (warden)
      "rejected",
      "cancelled",
      "completed"
    ],
    default: "pending"
  },

  approvalStatus: {
    advisor: { type: String, default: "pending" },
    hod: { type: String, default: "pending" },
    warden: { type: String, default: "pending" }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  qrToken: { type: String, unique: true, sparse: true }, // A secure unique string for the QR
  
  gateStatus: {
    type: String,
    enum: ["generated", "exited", "returned", "expired"],
    default: "generated"
  },
  
  actualOutTime: Date, // When they actually scanned at gate
  actualInTime: Date  // When they actually returned
});

export default mongoose.model("Outpass", outpassSchema);