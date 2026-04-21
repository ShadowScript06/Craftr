import { Router } from "express";


import upload from "../../middleware/upload";
import analyserController from "./analyser.controllers";
import { requireAuth } from "@clerk/express";
import { attachUser } from "../../middleware/attachUser";

const router = Router();

router.post("/upload", requireAuth(),attachUser, upload.single("resume"), analyserController.uploadResume);

router.post("/:id",requireAuth(),attachUser,  analyserController.analyzeResume);

router.get("/", requireAuth(),attachUser,  analyserController.getAllResumes);

router.get("/:id", requireAuth(),attachUser,  analyserController.getResumeById);

router.delete("/:id", requireAuth(),attachUser,  analyserController.deleteResume);

export default router;