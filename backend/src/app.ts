import express from "express";
import cors from "cors";
const dotenv=require('dotenv');

import {authRouter }from "./modules/auth/auth.routes";
import { jobRouter } from "./modules/job/job.routes";
import {clerkMiddleware} from "@clerk/express";

import applicationRouter from "./modules/application/application.routes";

import interviewRouter from "./modules/interview/interview.routes"

import sessionRouter from "./modules/session/session.routes";

import preparationRouter from "./modules/preparation/preparation.routes";




dotenv.config();

export const app=express();


app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());


app.use('/api/auth',authRouter);
app.use('/api/jobs',jobRouter);
app.use('/api/applications',applicationRouter);
app.use('/api/interviews',interviewRouter);
app.use('/api/interviews/:interviewId/sessions',sessionRouter);
app.use('/api/preparations',preparationRouter)



app.get("/health", async (req, res) => {
  res.send("API running");
});
