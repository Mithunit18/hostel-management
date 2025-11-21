import express from "express";
import {
  getAdvisorPending,
  advisorApprove,
  advisorReject,
  getAdvisorHistory
} from "../controllers/advisorController.js";

const router = express.Router();

router.get("/pending/:advisorId", getAdvisorPending);  // advisorId from frontend
router.put("/approve/:id", advisorApprove);
router.put("/reject/:id", advisorReject);
router.get("/history/:advisorId", getAdvisorHistory);

export default router;
