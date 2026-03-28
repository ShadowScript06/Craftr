import { Request,Response } from "express"
import { jobServices } from "./job.services";

async function getJobs(request:Request,response:Response){
    try {
        let pageNo:any=request.query.pageNo;


        if(!pageNo) pageNo=1;
        //@ts-ignore
        const jobs=await jobServices.getJobs(Number(pageNo));

        if (!jobs){
            return response.status(404).json({
                message:"No jobs found"
            })
        }

        
        return response.status(200).json({
            jobs:Array.isArray(jobs) ? jobs : [],
            message:"Jobs fetched"
        });

    } catch (error) {
        console.log(error);
        response.status(500).json("Internal Server Error.");
    }
}

export const jobController={getJobs}