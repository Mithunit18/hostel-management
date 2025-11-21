import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.NODE_ENV === "test"
        ? process.env.TEST_MONGO_URI
        : process.env.MONGO_URI;

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 20000,
      retryWrites: true,
      w: "majority",
    });

    // Stop logging during Jest tests
    if (process.env.NODE_ENV !== "test") {
      console.log(`MongoDB connected to ${process.env.NODE_ENV}`);
    }

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);

    // Do NOT kill Jest test runner
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
  }
};

export default connectDB;

