import axios from "axios";
import Job from "../../types/job";
export let jobData: Job[] = [];
const dotenv =require("dotenv");
dotenv.config();
const JOBS_API=process.env.JOBS_API

export async function fetchJobs() {
  try {

    if(!JOBS_API){
        throw new Error ("Bad Api");
    }
    const response = await axios.get(
      JOBS_API
    );

    const tempData = response.data.result.jobs;

    jobData=[];
   

   jobData= tempData.map((job: any) => {
      return {
        owner: {
          companyName: job.owner.companyName,
          rating: job.owner.rating,
          photo: job.owner.photo,
          locationAddress: job.owner.locationAdress,
          teamSize: job.owner.teamSize,
          sector: job.owner.sector,
        },
        title:job.title,
        type:job.type,
        url:job.url,
        createdAt:job.createdAt,
        skills_suggest:job.skills_suggest,
        description:{
            oneSentenceJobSummary:job.descriptionBreakdown.oneSentenceJobSummary,
            keywords:job.descriptionBreakdown.keywords,
            employmentType:job.descriptionBreakdown.employmentType,
            salaryRangeMinYearly:job.descriptionBreakdown.salaryRangeMinYearly,
            salaryRangeMaxYearly:job.descriptionBreakdown.salaryRangeMaxYearly,
            skillRequirement:job.descriptionBreakdown.skillRequirement
        },
        department:job.department,
        seniority:job.seniority,
        _id:job._id
      };
    });

    
    console.log("Job data fetched.");

    
  } catch (error) {
    console.log(error);
    console.log("Error in fetching jobs");
  }
}


