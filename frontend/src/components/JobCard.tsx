// src/components/JobCard.tsx

import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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

export default function JobCard({ job }: JobCardProps) {
  const navigate = useNavigate();

  const goToDetail = () => {
    navigate(`/jobs/${job._id}`, { state: { job } });
  };

  // Initials avatar background — derived from company name for consistency
  const initials = job.owner.companyName.slice(0, 2).toUpperCase();

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 16px 40px rgba(99,102,241,0.10)" }}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
      onClick={goToDetail}
      className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/30 p-5 flex flex-col gap-4 cursor-pointer group"
    >
      {/* Top row — avatar + company + date */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 4 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 border border-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0"
          >
            {initials}
          </motion.div>

          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {job.owner.companyName}
            </p>
            <p className="text-[10px] text-slate-300 font-medium mt-0.5">
              {job.createdAt.slice(0, 10)}
            </p>
          </div>
        </div>

        {/* Employment type pill */}
        {job.description?.employmentType && (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-500 ring-1 ring-indigo-100 shrink-0">
            {job.description.employmentType}
          </span>
        )}
      </div>

      {/* Title */}
      <div>
        <h2 className="text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors duration-200">
          {job.title}
        </h2>
        {job.description?.oneSentenceJobSummary && (
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
            {job.description.oneSentenceJobSummary}
          </p>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Department */}
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 13.255A23.931 23.931 0 0 1 12 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2m4 6h.01M5 20h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z" />
          </svg>
          {job.department}
        </span>

        <span className="text-slate-200">·</span>

        {/* Seniority */}
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z" />
          </svg>
          {job.seniority}
        </span>

        <span className="text-slate-200">·</span>

        {/* Location */}
        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {job.owner.locationAddress}
        </span>
      </div>

      {/* Salary + team size */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        {job.description?.salaryRangeMinYearly ? (
          <span className="text-xs font-bold text-slate-700">
            ${(job.description.salaryRangeMinYearly / 1000).toFixed(0)}k
            {" – "}
            ${(job.description.salaryRangeMaxYearly / 1000).toFixed(0)}k
            <span className="text-slate-400 font-normal"> / yr</span>
          </span>
        ) : (
          <span className="text-xs text-slate-300 font-medium">Salary not listed</span>
        )}

        <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {job.owner.teamSize} employees
        </span>
      </div>

      {/* Skills */}
      {job.description?.skillRequirement?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.description.skillRequirement.slice(0, 4).map((skill) => (
            <span
              key={skill}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/60"
            >
              {skill}
            </span>
          ))}
          {job.description.skillRequirement.length > 4 && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-400 border border-slate-200/60">
              +{job.description.skillRequirement.length - 4} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}