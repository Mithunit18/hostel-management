// ESM fix: import jest manually
import { jest } from "@jest/globals";

jest.setTimeout(60000);
// Mock nodemailer BEFORE importing app so your controllers use the mock transporter
import nodemailer from "nodemailer";

const sendMailMock = jest.fn().mockResolvedValue({ messageId: "mocked-id" });
nodemailer.createTransport = jest.fn(() => ({ sendMail: sendMailMock }));

import request from "supertest";
import path from "path";
const app = (await import(path.resolve("app.js"))).default;

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Outpass from "../models/Outpass.js";

let outpassId = "";
let advisorToken = "";
let hodToken = "";
let wardenToken = "";

beforeAll(async () => {
  // ensure DB connects (give Atlas time)
  await connectDB();
}, 60000);

const setupTestData = async () => {
  // Clean
  await User.deleteMany({});
  await Outpass.deleteMany({});

  // Create Warden
  const warden = await User.create({
    name: "Warden User",
    email: "warden@test.com",
    password: "wardenpass",
    role: "warden",
    hostelName: "A Block",
  });

  // Create HOD (linked to warden if you use wardenId on hod)
  const hod = await User.create({
    name: "HOD User",
    email: "hod@test.com",
    password: "hodpass",
    role: "hod",
    department: "CSE",
    wardenId: warden._id,
  });

  // Create Advisor (linked to HOD)
  const advisor = await User.create({
    name: "Advisor User",
    email: "advisor@test.com",
    password: "advisorpass",
    role: "advisor",
    department: "CSE",
    section: "A",
    hodId: hod._id,
  });

  // Create Student and connect to advisor/hod/warden
  const student = await User.create({
    name: "Student User",
    email: "student@test.com",
    password: "studentpass",
    department: "CSE",
    section: "A",
    year: "3rd year",
    regNo: "23IT092",
    role: "student",
    advisorId: [advisor._id],
    hodId: hod._id,
    wardenId: warden._id,
  });

  // Login (use real login if your tests rely on JWT; tokens returned by login route)
  const advLogin = await request(app).post("/api/auth/login").send({ email: "advisor@test.com", password: "advisorpass" });
  advisorToken = advLogin.body.token;

  const hodLogin = await request(app).post("/api/auth/login").send({ email: "hod@test.com", password: "hodpass" });
  hodToken = hodLogin.body.token;

  const wardLogin = await request(app).post("/api/auth/login").send({ email: "warden@test.com", password: "wardenpass" });
  wardenToken = wardLogin.body.token;

  // Create Outpass
  const outpass = await Outpass.create({
    studentId: student._id,
    wardenId: warden._id,
    name: student.name,
    department: "CSE",
    year: "3",
    semester: "6",
    room: "B-204",
    outDate: "2025-01-01",
    outTime: "08:00",
    inDate: "2025-01-02",
    inTime: "18:00",
    reason: "Going home",
    approvalStatus: { advisor: "pending", hod: "pending", warden: "pending" },
    gateStatus: "generated",
  });

  outpassId = outpass._id.toString();
};

beforeEach(async () => {
  await setupTestData();
}, 60000);

afterAll(async () => {
  // Close mongoose
  await mongoose.connection.close();
  console.log("Mongoose connection closed after approval tests.");
}, 60000);

// --- Tests ---
describe("Outpass Approval Flow", () => {
  it("Advisor approves outpass", async () => {
    const res = await request(app)
      .put(`/api/advisor/approve/${outpassId}`)
      .set("Authorization", `Bearer ${advisorToken}`)
      .send({ status: "approved" });

    expect(res.statusCode).toBe(200);
    expect(res.body.outpass).toBeDefined();
    expect(res.body.outpass.status).toBe("advisor-approved");
    expect(res.body.outpass.approvalStatus.advisor).toBe("approved");
  }, 30000);

  it("HOD approves outpass", async () => {
    const res = await request(app)
      .put(`/api/hod/approve/${outpassId}`)
      .set("Authorization", `Bearer ${hodToken}`)
      .send({ status: "approved" });

    expect(res.statusCode).toBe(200);
    expect(res.body.outpass).toBeDefined();
    expect(res.body.outpass.status).toBe("hod-approved");
    expect(res.body.outpass.approvalStatus.hod).toBe("approved");
  }, 30000);

  it("Warden approves outpass", async () => {
    const res = await request(app)
      .put(`/api/warden/approve/${outpassId}`)
      .set("Authorization", `Bearer ${wardenToken}`)
      .send({ status: "approved" });

    expect(res.statusCode).toBe(200);
    expect(res.body.outpass).toBeDefined();
    expect(res.body.outpass.status).toBe("approved"); // final approval
    expect(res.body.outpass.approvalStatus.warden).toBe("approved");

    // Verify that nodemailer sendMail was called (mock)
    expect(sendMailMock).toHaveBeenCalled();
  }, 30000);
});
