import { Request, Response } from "express";
import { jobServices } from "./job.services";

async function getJobs(request: Request, response: Response) {
  try {
    let pageNo: any = request.query.pageNo;

    if (!pageNo) pageNo = 1;
    //@ts-ignore
    const jobs = await jobServices.getJobs(Number(pageNo));

    if (!jobs) {
      return response.status(404).json({
        jobs: Array.isArray(jobs) ? jobs : [],
        message: "No jobs found",
      });
    }

    return response.status(200).json({
      jobs: Array.isArray(jobs) ? jobs : [],
      message: "Jobs fetched",
    });
  } catch (error) {
    console.log(error);
    response.status(500).json("Internal Server Error.");
  }
}

async function getJobById(request: Request, response: Response) {
  try {
    let jobId = request.params.id;

    if (!jobId) return response.status(403).json({message:"Invalid Input"});
    //@ts-ignore
    let job = jobServices.getJobById(jobId);

    if (!job) {
      return response.status(404).json({
        message: "No Job found",
      });
    }

    return response.status(200).json({
      job,
      message: "Job fetched",
    });
  } catch (error) {
    console.log(error);
    response.status(500).json("Internal Server Error.");
  }
}

function searchJobs(request: Request, response: Response) {
  try {
   
    let search=request.query.search;
   
    if(!search) return response.status(403).json({message:"Invalid Input"});


    //@ts-ignore
    let jobs = jobServices.searchJobs(search);

    if(jobs.length<=0){
      return response.status(404).json({message:"No jobs found."})
    }

    return response.status(200).json({
      message:"Jobs fetched",
      jobs
    })

  } catch (error) {
    console.log(error);
    response.status(500).json("Internal Server Error.");
  }
}

export const jobController = { getJobs, getJobById, searchJobs };
