import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import type { Job } from "../types/job";

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/jobs/${id}`);
        if (res.status === 200) setJob(res.data.job);
      } catch (err) {
        setError("Failed to fetch job");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);



  if (loading)
    return (
      <div className="p-6 text-center text-gray-600 font-medium text-lg">
        Loading job details...
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-500 font-semibold">{error}</div>
    );
  if (!job)
    return (
      <div className="p-6 text-center text-gray-700 font-medium">
        No job found
      </div>
    );

  const formatCurrency = (value?: number) =>
    value ? `$${value.toLocaleString()}` : "N/A";

  const formattedDate = new Date(job.createdAt).toLocaleDateString();

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Header */}
          <div className="bg-linear-to-r from-blue-50 to-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={job.owner.photo || "/logo.png"}
              alt={job.owner.companyName}
              className="h-28 w-28 object-cover rounded-xl border border-gray-200"
            />
            <div className="flex-1 space-y-2">
              <h1 className="text-4xl font-extrabold text-gray-900">
                {job.title}
              </h1>
              <p className="text-gray-600 text-lg font-medium">
                {job.owner.companyName}
              </p>
              <p className="text-gray-500">
                {job.department} • {job.seniority} • {job.type}
              </p>
              <p className="text-gray-400 text-sm">
                Posted on {formattedDate}
              </p>
            </div>
          </div>

          {/* Job Summary */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition-shadow duration-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Job Summary
            </h2>
            <p className="text-gray-700">{job.description.oneSentenceJobSummary}</p>
          </div>

          {/* Skills */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition-shadow duration-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Skills Required
            </h2>
            <div className="flex flex-wrap gap-3">
              {(job.description.keywords || []).map((skill) => (
                <span
                  key={skill}
                  className="bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-sm font-medium border border-blue-100 hover:scale-105 transition-transform"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Suggested Skills */}
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition-shadow duration-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Suggested Skills
            </h2>
            <div className="flex flex-wrap gap-3">
              {(job.skills_suggest || []).map((skill) => (
                <span
                  key={skill}
                  className="bg-green-50 text-green-700 px-4 py-1 rounded-full text-sm font-medium border border-green-100 hover:scale-105 transition-transform"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Apply Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Apply for this job</h3>
            <a
              href={job.url}
              target="_blank"
              className="w-full text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow hover:bg-blue-700 transition-colors"
            >
              Apply Now
            </a>
            <button
              onClick={() => navigate(-1)}
              className="text-gray-500 hover:text-gray-800 font-medium transition-colors"
            >
              ← Back to Jobs
            </button>
          </div>

          {/* Company Stats */}
          <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Company Info</h3>
            <div className="flex justify-between">
              <span className="text-gray-500">Rating</span>
              <span className="font-semibold text-gray-900">{job.owner.rating} ⭐</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Team Size</span>
              <span className="font-semibold text-gray-900">{job.owner.teamSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Salary</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(job.description.salaryRangeMinYearly)} -{" "}
                {formatCurrency(job.description.salaryRangeMaxYearly)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Employment Type</span>
              <span className="font-semibold text-gray-900">{job.description.employmentType}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;