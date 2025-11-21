import { jest } from "@jest/globals";
jest.setTimeout(60000);


import request from 'supertest';
import path from 'path';
const app = (await import(path.resolve('app.js'))).default;
import mongoose from "mongoose";
import connectDB from '../config/db';
import User from '../models/User.js';
import Outpass from '../models/Outpass.js';


beforeAll(async () => {
    await connectDB();
}, 60000);

let advisorToken, hodToken, wardenToken, studentToken;
let outpassId, studentId, advisorId, hodId, wardenId;

const testHistoryData = async () => {

    await User.deleteMany({});
    await Outpass.deleteMany({});

    //create warden
    const warden = await User.create({
        name: "Warden User",
        email: "warden@test.com",
        password: "wardenpass",
        role: "warden",
        hostelName: "A Block"
    })
    wardenId = warden._id;

    //create hod
    const hod = await User.create({
        name: "HOD User",
        email: "hod@test.com",
        password: "hodpass",
        role: "hod",
        department: "IT"
    })
    hodId = hod._id;

    const advisor = await User.create({
        name: "Advisor User",
        email: "advisor@test.com",
        password: "advisorpass",
        role: "advisor",
        department: "IT",
        section: "A",
        hodId: hod._id
    })
    advisorId = advisor._id;

    //create student
    const student = await User.create({
        name: "Student User",
        email: "student@test.com",
        password: "studentpass",
        role: "student",
        department: "IT",
        section: "A",
        advisorId: [advisor._id],
        hodId: hod._id,
        regNo: "23IT001",
        year: "3rd Year"
    })
    studentId = student._id;

    //create outpass
    const outpass = await Outpass.create({
        studentId: student._id,
        wardenId: warden._id,
        department: "IT",
        semester: "6th",
        year: "3rd Year",
        room: "101",
        outDate: "2024-07-01",
        inDate: "2024-07-02",
        outTime: "10:00",
        inTime: "18:00",
        reason: "Personal Work",
        approvalStatus: { advisor: "approved", hod: "approved", warden: "approved" },
        status: "approved"
    })
    outpassId = outpass._id;

    //login

    studentToken = (await request(app).post("/api/auth/login").send({ email: "student@test.com", password: "studentpass" })).body.token;

    advisorToken = (await request(app).post("/api/auth/login").send({ email: "advisor@test.com", password: "advisorpass" })).body.token;

    hodToken = (await request(app).post("/api/auth/login").send({ email: "hod@test.com", password: "hospass" })).body.token;

    wardenToken = (await request(app).post("/api/auth/login").send({ email: "warden@test.com", password: "wardenpass" })).body.token;
}

beforeEach(async () => {
    await testHistoryData();
}, 60000);

afterAll(async () => {
    await mongoose.connection.close();
    console.log("Mongoose connection closed after History tests.");
}, 60000);

//---Tests---
describe("Advisor History", () => {
    it("should return advisor's pending outpasses", async () => {
        const res = await request(app)
            .get(`/api/advisor/history/${advisorId}`)
            .set("Authorization", `Bearer ${advisorToken}`);


        expect(res.body.outpasses.length).toBe(1);

        expect(res.body.outpasses[0].approvalStatus.advisor).toBe("approved");

        // ensure mapped student
        expect(res.body.outpasses[0].studentId._id).toBe(studentId.toString());
    });
});

//
// =============================
//      HOD HISTORY TEST
// =============================
describe("HOD History", () => {
    it("should return advisor-approved outpasses", async () => {
        const res = await request(app)
            .get(`/api/hod/history/${hodId}`)
            .set("Authorization", `Bearer ${hodToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.outpasses.length).toBe(1);
        expect(res.body.outpasses[0].approvalStatus.hod).toBe("approved");

    });
});

//
// =============================
//      WARDEN HISTORY TEST
// =============================
describe("Warden History", () => {
    it("should return hod-approved outpasses", async () => {
        const res = await request(app)
            .get(`/api/warden/history/${wardenId}`)
            .set("Authorization", `Bearer ${wardenToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.outpasses.length).toBe(1);
        expect(res.body.outpasses[0].approvalStatus.warden).toBe("approved");
        expect(res.body.outpasses[0].status).toBe("approved");
    });
});