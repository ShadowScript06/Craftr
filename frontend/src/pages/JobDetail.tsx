import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import type { Job } from "../types/job";

function JobDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const job = location.state?.job as Job | undefined;

  if (!job) return <div>Job not found</div>;

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md mt-6 rounded-lg">
        <div className="flex items-center space-x-4 mb-4">
          <img
            src={job.owner.photo || "/logo.png"}
            alt={job.owner.companyName}
            className="h-20 w-20 object-cover rounded"
          />
          <div>
            <h1 className="text-2xl font-bold">{job.title}</h1>
            <p className="text-gray-600">{job.owner.companyName}</p>
            <p className="text-gray-500">
              {job.department} • {job.seniority}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-gray-700 font-semibold">
            {job.description.oneSentenceJobSummary}
          </p>

          <div>
            <h3 className="font-semibold">Skills Required:</h3>
            <ul className="list-disc list-inside">
              {job.description.skillRequirement.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </div>

          <a
            href={job.url}
            target="_blank"
            className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply Now
          </a>
        </div>

        <button
          className="mt-6 text-gray-500 hover:text-gray-800"
          onClick={() => navigate(-1)}
        >
          ← Back to Jobs
        </button>
      </div>
    </div>
  );
}

export default JobDetail;