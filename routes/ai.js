import { Router } from "express";
import { aiSessionHandler } from "../middlewares/aiMiddlewares.js";
import { askQuestion, destroySession, updateSession } from "../controllers/pitchController.js";

const router = Router();
router.post("/", aiSessionHandler, askQuestion);
router.patch("/", updateSession);
router.delete("/", destroySession);

export default router;
