import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,

  regNo: String,       // only for students
  department: String,  // student, advisor, hod
  year: String,        // only for students
  section: String,    // student + advisor
  hostelName: String,    

  // ⭐ Role Mapping Fields (IMPORTANT for approval workflow)
advisorId: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }
],

  hodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  wardenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  role: {
    type: String,
    enum: ["student", "advisor", "hod", "warden"],
    required: true,
  },
});

export default mongoose.model("User", userSchema);
