import express from "express";
import cors from "cors";
const dotenv=require('dotenv');

import {authRouter }from "./modules/auth/auth.routes";
import { jobRouter } from "./modules/job/job.routes";
import {clerkMiddleware} from "@clerk/express";





dotenv.config();

export const app=express();


app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.use('/api/auth',authRouter);
app.use('/api/jobs',jobRouter);



app.get("/health", async (req, res) => {
  res.send("API running");
});
