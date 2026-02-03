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

    // Fix: Recreate qrToken index with sparse option
    try {
      const collection = mongoose.connection.db.collection("outpasses");
      const indexes = await collection.indexes();
      const qrIndex = indexes.find(idx => idx.name === "qrToken_1");
      if (qrIndex && !qrIndex.sparse) {
        await collection.dropIndex("qrToken_1");
        console.log("Dropped old qrToken_1 index, will be recreated with sparse:true");
      }
    } catch (indexError) {
      // Index might not exist, that's fine
      if (indexError.code !== 27) { // 27 = IndexNotFound
        console.log("Index check:", indexError.message);
      }
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

