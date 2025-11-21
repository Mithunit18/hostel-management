import express from "express";
import {
  applyOutpass,
  getOutpassesByStudent,
  getRequests,
  approveOutpass,
  cancelOutpass ,
} from "../controllers/outpassController.js";

const router = express.Router();

router.post("/apply", applyOutpass);
router.get("/student/:id", getOutpassesByStudent);
router.put("/cancel/:id", cancelOutpass); 
router.get("/requests/:role", getRequests);
router.post("/approve", approveOutpass);

export default router;
