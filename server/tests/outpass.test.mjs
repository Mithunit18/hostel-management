import request from "supertest";
import path from "path";

// Load real app.js
const app = (await import(path.resolve("app.js"))).default;

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Outpass from "../models/Outpass.js";

let token = "";
let studentId = "";
let wardenId = "";

// Connect to DB before tests
beforeAll(async () => {
  await connectDB();
}, 60000);

// Reset DB before each test
beforeEach(async () => {
  await User.deleteMany({});
  await Outpass.deleteMany({});

  // Create warden
  const warden = await User.create({
    name: "Test Warden",
    email: "warden@test.com",
    password: "hashedpass",
    role: "warden",
    hostelName: "A Block"
  });
  wardenId = warden._id.toString();

  // Create student
  const student = await User.create({
    name: "Test Student",
    email: "student@test.com",
    password: "$2b$10$NZaB3qk.fakehash.fakehash.fakehashxxxxxx", // bcrypt dummy
    department: "CSE",
    year: "3",
    section: "A",
    role: "student"
  });

  studentId = student._id.toString();

  // Login student (your backend compares hashed passwords → so bypass API)
  token = "DUMMY_TOKEN"; // Your backend does not validate JWT in applyOutpass
}, 60000);

// Close DB after all tests
afterAll(async () => {
  await mongoose.connection.close();
}, 60000);

// ------------------------
// REAL TEST (Matches backend)
// ------------------------

describe("Apply Outpass API", () => {
  it("should create an outpass request successfully", async () => {

    // Your backend REQUIRES THESE FIELDS IN BODY
    const res = await request(app)
      .post("/api/outpass/apply")
      .set("Authorization", `Bearer ${token}`)
      .send({
        studentId: studentId,
        name: "Test Student",
        department: "CSE",
        year: "3",
        semester: "6",
        room: "B-204",
        wardenId: wardenId,
        outDate: "2025-01-01",
        outTime: "08:00",
        inDate: "2025-01-02",
        inTime: "18:00",
        reason: "Going home"
      });

    console.log("API Response => ", res.body);

    // Your backend returns:
    // { success: true, outpass: {...}, message: "..." }
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.outpass; // <--- Correct structure

    // Check essential fields
    expect(data.studentId).toBe(studentId);
    expect(data.wardenId).toBe(wardenId);
    expect(data.name).toBe("Test Student");
    expect(data.department).toBe("CSE");
    expect(data.reason).toBe("Going home");

    // Default statuses
    expect(data.approvalStatus.advisor).toBe("pending");
    expect(data.approvalStatus.hod).toBe("pending");
    expect(data.approvalStatus.warden).toBe("pending");
  }, 60000);
});
