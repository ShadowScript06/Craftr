
import { jobData } from "../../utils/data/job"


async function getJobs(pageNo:number){

    if(pageNo*10 -10 > jobData.length || pageNo<=0){
        return null;
    }

    let start=(pageNo-1)*10;
    let end=pageNo*10;

    const jobs=[];
    
    for(let i=start; i<end; i++){
        jobs.push(jobData[i])
    }

    return jobs

}

export const jobServices={getJobs}