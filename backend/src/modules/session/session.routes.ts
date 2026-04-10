import { requireAuth } from "@clerk/express";
import express from "express";
import { attachUser } from "../../middleware/attachUser";
import { sessioncontroller } from "./sesssion.controllers";

const router=express.Router({ mergeParams: true });

// Start interview session
router.post(
  "/start",
  requireAuth(),
  attachUser,
  sessioncontroller.startSession
);

// end Session
router.post(
    "/:sessionId/end",
  requireAuth(),
  attachUser,
  sessioncontroller.endSession
)

// retry Session
router.post(
  "/:sessionId/retry",
  requireAuth(),
  attachUser,
  sessioncontroller.retrySession
);

// get all sessions
router.get("/", requireAuth(),
  attachUser, requireAuth(),
  attachUser,sessioncontroller.getSessions);

// get session by id
router.get("/:sessionId",  requireAuth(),
  attachUser,requireAuth(),
  attachUser,sessioncontroller.getSessionById);

// delete session
router.delete("/:sessionId",  requireAuth(),
  attachUser,requireAuth(),
  attachUser,sessioncontroller.deleteSession);

// submitAnswer
router.post("/:sessionId/questions/:questionId/answer",requireAuth(),
  attachUser, sessioncontroller.submitAnswer);

// run code
router.post("/:sessionId/questions/:questionId/run-code",requireAuth(),
  attachUser, sessioncontroller.runCode);


export default router;