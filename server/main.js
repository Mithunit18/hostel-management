import app from "./app.js";
import { startCronJob } from "./config/cronJobs.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

// Only connect DB and start server if NOT running tests
if (process.env.NODE_ENV !== "test") {
  connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
  });

  // Start cron job only when server runs normally
  startCronJob();
}

export default app;
