import {  useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import type {Job} from "../types/job"
import axios from "axios";
import JobCard from "../components/JobCard";
function JobsPage() {
    const[jobs,setJobs]=useState<Job[]>([]);

    

    useEffect(()=>{
        async function fetchJobs(){
            const response=await axios.get(`${import.meta.env.VITE_BACKEND_URL}/jobs`);
            setJobs(response.data.jobs);
        }

        fetchJobs();
    },[])

  return (
    <div>
      <Navbar />
      <div className="bg-white shadow p-4 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold m">Search Jobs...</h1>{" "}
        <input
          type="text"
          placeholder="Search jobs by title..."
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-col gap-3">
            {jobs.map((job)=> {return(<JobCard job={job}/>)})}
        </div>
      </div>
    </div>
  );
}

export default JobsPage;
