
import request from "supertest";
import path from "path";

// ALWAYS load the correct app.js file (absolute path)
const app = (await import(path.resolve("app.js"))).default;

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import User from "../models/User.js";

beforeAll(async () => {
  process.env.NODE_ENV = "test"; // ensure test mode
  await connectDB();
}, 60000); // allow 20 sec for Atlas

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth API Tests", () => {
  it(
    "should register a new user",
    async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "testuser@example.com",
          password: "password123",
          regNo: "23IT092",
          department: "IT",
          year: "3rd year",
          section: "A",
          role: "student",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    },
    20000
  );

  it(
    "should login successfully",
    async () => {
      await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "testuser@example.com",
        password: "password123",
        regNo: "23IT092",
        department: "IT",
        year: "3rd year",
        section: "A",
        role: "student",
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "testuser@example.com",
          password: "password123",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    },
    60000
  );
});
