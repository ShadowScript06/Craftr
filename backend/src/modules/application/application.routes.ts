import express, { application } from "express";

import { requireAuth } from "@clerk/express";

import { validate } from "../../middleware/inputValidator";
import { createApplicationSchema } from "../../config/Validations/createApplicationSchema";
import { applicationController } from "./application.controllers";
import { attachUser } from "../../middleware/attachUser";
import { updateApplicationSchema } from "../../config/Validations/updateApplicationSchema";
import { createNoteSchema } from "../../config/Validations/createNoteSchema";

const router = express.Router();

router.post(
  "/",
  requireAuth(),
  attachUser,
  validate(createApplicationSchema),
  applicationController.createApplication,
);


router.get('/', requireAuth(),attachUser,applicationController.getAllApplications );

router.get('/:id', requireAuth(),attachUser,applicationController.getApplicationById )

router.patch(
  "/:applicationId",
  requireAuth(),                    // 🔐 ensure user logged in
  attachUser,                       // 🧠 attach req.user.id
  validate(updateApplicationSchema), // ✅ validate params + body
  applicationController.updateApplication
);


router.post(
  "/:applicationId/notes",
  requireAuth(),
  attachUser,
  validate(createNoteSchema),
  applicationController.createNote
);


router.delete(
  "/notes/:noteId",
  requireAuth(),
  attachUser,
  applicationController.deleteNote
);

router.get(
  "/notes/:applicationId",
  requireAuth(),      // 🔐 ensure user is logged in
  attachUser,         // 🧠 attach request.user.id
  applicationController.getAllNotes
);

export default router;
