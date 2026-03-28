import express from "express";
import { jobController } from "./job.controllers";



export const jobRouter=express.Router();

jobRouter.get('/',jobController.getJobs);