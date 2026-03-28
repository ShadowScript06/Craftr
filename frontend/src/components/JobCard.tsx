// src/components/JobCard.tsx

import { useNavigate } from "react-router-dom";

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    type: string;
    url: string;
    createdAt: string;
    skills_suggest: string[];
    department: string;
    seniority: string;
    owner: {
      companyName: string;
      rating: string;
      photo: string;
      locationAddress: string;
      teamSize: number;
      sector: string;
    };
    description: {
      oneSentenceJobSummary: string;
      keywords: string[];
      employmentType: string;
      salaryRangeMinYearly: number;
      salaryRangeMaxYearly: number;
      skillRequirement: string[];
    };
  };
}



export default function JobCard({ job }:JobCardProps ) {
  const navigate = useNavigate();

  const goToDetail = () => {
  navigate(`/jobs/${job._id}`, { state: { job } });
};

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col">
      {/* Clickable Photo */}
      

      <div className="p-4 flex flex-col flex-1">
        {/* Clickable Title */}
        <h2
          className="text-lg font-bold cursor-pointer hover:text-blue-500"
          onClick={goToDetail}
        >
          {job.title}
        </h2>

        <p className="text-gray-600">{job.owner.companyName}</p>

        <div className="mt-auto">
          <p className="text-sm text-gray-500">
            {job.department} • {job.seniority}
          </p>
          <p className="text-sm text-gray-500">
            {job.owner.teamSize} employees • {job.owner.sector}
          </p>
        </div>
      </div>
    </div>
  );
}