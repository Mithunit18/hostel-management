import express from "express";
import {
  getHodPending,
  getHodHistory,
  hodApprove,
  hodReject
} from "../controllers/hodController.js";

const router = express.Router();

// Routes for HOD
router.get("/pending/:hodId", getHodPending);
router.get("/history/:hodId", getHodHistory);
router.put("/approve/:id", hodApprove); // 'id' is outpass_id
router.put("/reject/:id", hodReject);   // 'id' is outpass_id

export default router;