import { jest } from "@jest/globals"
jest.setTimeout(60000);

import path from "path"
const app = (await import(path.resolve("app.js"))).default;
import mongoose from "mongoose";
import User from "../models/User.js"
import Outpass from "../models/Outpass.js";
import connectDB from "../config/db";
import request from "supertest"

beforeAll(async () => {
    await connectDB();
}, 60000)

let studentId, advisorId, hodId, wardenId, outpassId;
let studentToken, advisorToken, hodToken, wardenToken;
const testPendingData = async () => {
    await User.deleteMany({});
    await Outpass.deleteMany({});

    // create warden
    const warden = await User.create({
        name: "warden name",
        email: "test@warden.com",
        password: "123456",
        hostelName: "pothigai",
        role: "warden"
    })

    wardenId = warden._id;

    // create HOD
    const hod = await User.create({
        name: "Hod name",
        email: "test@hod.com",
        password: "123456",
        department: "IT",
        role: "hod"
    })

    hodId = hod._id;

    // create advisor
    const advisor = await User.create({
        name: "advisor name",
        email: "test@advisor.com",
        password: "123456",
        section: "C",
        department: "IT",
        role: "advisor",
        hodId: hodId
    })

    advisorId = advisor._id;

    // create student
    const student = await User.create({
        name: "student name",
        email: "test@student.com",
        password: "123456",
        section: "C",
        department: "IT",
        year: "3rd year",
        advisorId: [advisorId],
        hodId: hodId,
        role: "student",
        regNo: "23IT092"
    })

    studentId = student._id;

    // create outpass
    const outpass = Outpass.create({
        studentId: studentId,
        wardenId: wardenId,
        name: "student name",
        department: "IT",
        section: "C",
        regNo: "23it092",
        year: "3rd year",
        outDate: "2024-02-11",
        outTime: "10.00",
        inTime: "5.00",
        inDate: "2024-02-15",
        reason: "GOing to Home",
        approvalStatus: {
            advisor: "pending",
            hod: "pending",
            warden: "pending"
        },
        status: "pending"
    })

    outpassId = outpass._id;

    //login function
    const stdLogin = await request(app).post("/api/auth/login").send({email:"test@student.com",password:"123456"});
    studentToken = stdLogin.body.token;

    const advLogin = await request(app).post("/api/auth/login").send({ email: "test@advisor.com", password: "123456" });
    advisorToken = advLogin.body.token;

    const hodLogin = await request(app).post("/api/auth/login").send({ email: "test@hod.com", password: "123456" });
    hodToken = hodLogin.body.token;

    const wardLogin = await request(app).post("/api/auth/login").send({ email: "test@warden.com", password: "123456" });
    wardenToken = wardLogin.body.token;
}

beforeEach(async () => {
    await testPendingData();
}, 60000)

afterAll(async() => {
    await mongoose.connection.close();
},60000);

describe("fetching the advisor pending successfully ", () => {
    it("should return advisor pending outpasses", async() => {
        const res = await request(app)
        .get(`/api/advisor/pending/${advisorId}`)

        expect(res.statusCode).toBe(200);
    })

})

describe("fetching the hod pending successfully ", () => {
    it("should return hod pending outpasses", async() => {
        const res = await request(app)
        .get(`/api/hod/pending/${hodId}`)

        expect(res.statusCode).toBe(200);
    })

})

describe("fetching the warden pending successfully ", () => {
    it("should return advisor pending outpasses", async() => {
        const res = await request(app)
        .get(`/api/warden/pending/${wardenId}`)

        expect(res.statusCode).toBe(200);
    })

})