import express from "express";
import preparationController from "./preparation.controllers";
import { requireAuth } from "@clerk/express";
import { attachUser } from "../../middleware/attachUser";
import {validate} from "../../middleware/inputValidator";
import { createPreparationSessionSchema } from "../../config/Validations/createPreparationSessionSchema";


const router=express.Router();


// create Session
router.post('/sessions',requireAuth(),attachUser,validate(createPreparationSessionSchema),preparationController.createSession);

// get All sessions
router.get('/sessions',requireAuth(),attachUser,preparationController.getAllSession);


// get session By id
router.get('/sessions/:sessionId',requireAuth(),attachUser,preparationController.getSessionById);


// delete session
router.delete('/sessions/:sessionId',requireAuth(),attachUser,preparationController.deleteSession);

// genrate more questions
router.post('/sessions/:sessionId/questions',requireAuth(),attachUser,preparationController.generateMoreQuestions)
 

export default router;


