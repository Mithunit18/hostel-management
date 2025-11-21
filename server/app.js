import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import outpassRoutes from "./routes/outpassRoutes.js";
import advisorRoutes from "./routes/advisorRoutes.js";
import hodRoutes from './routes/hodRoutes.js';
import wardenRoutes from "./routes/wardenRoutes.js";
import gateRoutes from "./routes/gateRoutes.js";



const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/outpass", outpassRoutes);
app.use("/api/advisor", advisorRoutes);
app.use('/api/hod', hodRoutes);
app.use("/api/warden",wardenRoutes);
app.use("/api/gate", gateRoutes);

export default app;
