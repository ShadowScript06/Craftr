import express, {Request,Response} from "express";
import { authController } from "./auth.controllers";
import { requireAuth } from "@clerk/express";

export const authRouter=express.Router();



authRouter.post('/sync-user', requireAuth(), authController.syncUser);