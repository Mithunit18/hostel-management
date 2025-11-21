import express from "express";
import {getWardens,
    getWardenPending,
  wardenApprove,
  wardenReject,
  getWardenHistory
} from "../controllers/wardenController.js";

const router = express.Router();

router.get("/get-wardens",getWardens);
router.get('/pending/:wardenId',  getWardenPending);
router.get('/history/:wardenId',  getWardenHistory);
router.put('/approve/:id', wardenApprove);
router.put('/reject/:id',wardenReject);

export default router;