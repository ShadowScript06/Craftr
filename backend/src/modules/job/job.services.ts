import { jobData } from "../../utils/data/job";
import Job from "../../types/job";
async function getJobs(pageNo: number) {
  const limit = 10;

  if (pageNo <= 0) return [];

  const start = (pageNo - 1) * limit;
  const end = Math.min(start + limit, jobData.length);

  if (start >= jobData.length) return [];

  const jobs = [];

  for (let i = start; i < end; i++) {
    jobs.push(jobData[i]);
  }

  return jobs;
}

function getJobById(id: string) {
  for (let i = 0; i < jobData.length; i++) {
    const currJob = jobData[i];

    if (currJob._id === id) {
      return currJob;
    }
  }

  return null;
}

function searchJobs(search: string) {
  let jobs: Job[] = [];

  jobs = jobData.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase()),
  );

 
  return jobs;
}

export const jobServices = { getJobs, getJobById, searchJobs };
