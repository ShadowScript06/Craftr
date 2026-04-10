import express from "express";
import { interviewController } from "./interview.controllers";
import { requireAuth } from "@clerk/express";
import { attachUser } from "../../middleware/attachUser";
import {validate} from "../../middleware/inputValidator"
import { createInterviewSchema } from "../../config/Validations/createInterviewSchema";



const router=express.Router();



// Post Interview 
router.post('/',requireAuth(),attachUser,validate(createInterviewSchema), interviewController.createInterview);



// Get all Interviews
router.get('/',requireAuth(),attachUser, interviewController.getAllInterviews);


// get by id
router.get('/:interviewId',requireAuth(),attachUser, interviewController.getInterviewById);

//delete by id

router.delete('/:interviewId',requireAuth(),attachUser, interviewController.deleteInterview);


export default router;