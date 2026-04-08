import express from "express";
import { jobController } from "./job.controllers";



export const jobRouter=express.Router();

jobRouter.get('/search', jobController.searchJobs);
jobRouter.get('/',jobController.getJobs);
jobRouter.get('/:id',jobController.getJobById);
