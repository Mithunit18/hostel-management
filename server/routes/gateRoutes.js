import express from "express";
import { verifyGatePass} from "../controllers/gateController.js";

const router = express.Router();

// The scanner will POST the qrToken here
router.post("/verify", verifyGatePass);


export default router;