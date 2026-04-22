import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import type { Job } from "../types/job";
import { motion } from "framer-motion";

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/jobs/${id}`);
        if (res.status === 200) setJob(res.data.job);
      } catch (err) {
        console.log(err);
        setError("Failed to fetch job");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const formatCurrency = (value?: number) =>
    value ? `$${value.toLocaleString()}` : "N/A";

  const formattedDate = job ? new Date(job.createdAt).toLocaleDateString() : "";

  // ── Loading ──
  if (loading)
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 font-sans">
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10 space-y-5">
          {/* Shimmer skeleton */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
              className="bg-white/80 rounded-3xl border border-slate-200/60 shadow-md h-32"
            />
          ))}
        </div>
      </div>
    );

  // ── Error ──
  if (error)
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 font-sans">
        <Navbar />
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <motion.div
            animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-5xl mb-4"
          >
            ⚡
          </motion.div>
          <div className="text-base font-semibold text-slate-700 mb-1">{error}</div>
          <div className="text-sm text-slate-400">Check your connection and try again.</div>
        </motion.div>
      </div>
    );

  // ── No job ──
  if (!job)
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 font-sans">
        <Navbar />
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl mb-4"
          >
            🔍
          </motion.div>
          <div className="text-base font-semibold text-slate-700">No job found</div>
          <div className="text-sm text-slate-400 mt-1">This listing may have been removed.</div>
        </motion.div>
      </div>
    );

  const initials = job.owner.companyName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -3 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M19 12H5m7-7-7 7 7 7" />
          </svg>
          Back to Jobs
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left / Main ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Job Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7"
            >
              {/* Company row */}
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-100 to-violet-100 border border-indigo-100 flex items-center justify-center text-lg font-black text-indigo-600 shrink-0 overflow-hidden"
                >
                  {job.owner.photo
                    ? <img src={job.owner.photo} alt={job.owner.companyName} className="w-full h-full object-cover" />
                    : initials}
                </motion.div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="uppercase tracking-wider">{job.owner.companyName}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400 font-normal">Posted {formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                    </svg>
                    {job.owner.locationAddress}
                  </div>
                </div>
              </div>

              {/* Title + badges */}
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-2">
                {[job.department, job.seniority, job.type].map((tag) => tag && (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-500 ring-1 ring-indigo-100"
                  >
                    {tag}
                  </span>
                ))}
                {job.description?.employmentType && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-violet-50 text-violet-500 ring-1 ring-violet-100">
                    {job.description.employmentType}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Job Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, type: "spring", stiffness: 260, damping: 26 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                </svg>
                <span className="text-sm font-semibold text-slate-800">Job Summary</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                {job.description.oneSentenceJobSummary}
              </p>
            </motion.div>

            {/* Skills Required */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.13, type: "spring", stiffness: 260, damping: 26 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="text-sm font-semibold text-slate-800">Skills Required</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(job.description.keywords || []).map((skill) => (
                  <motion.span
                    key={skill}
                    whileHover={{ scale: 1.05, y: -1 }}
                    className="px-3 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 cursor-default"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Suggested Skills */}
            {job.skills_suggest?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, type: "spring", stiffness: 260, damping: 26 }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-800">Suggested Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(job.skills_suggest || []).map((skill) => (
                    <motion.span
                      key={skill}
                      whileHover={{ scale: 1.05, y: -1 }}
                      className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-5">

            {/* Apply Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 26 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-6 flex flex-col gap-3"
            >
              <span className="text-sm font-semibold text-slate-800">Ready to apply?</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit your application directly on the company's portal.
              </p>

              <motion.a
                href={job.url}
                target="_blank"
                whileHover={{ scale: 1.03, y: -1, boxShadow: "0 10px 28px rgba(99,102,241,0.35)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full text-center px-5 py-2.5 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 transition-all duration-200"
              >
                Apply Now →
              </motion.a>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(-1)}
                className="w-full px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200"
              >
                ← Back to Jobs
              </motion.button>
            </motion.div>

            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, type: "spring", stiffness: 260, damping: 26 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-6"
            >
              <div className="flex items-center gap-2.5 mb-5">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4" />
                </svg>
                <span className="text-sm font-semibold text-slate-800">Company Info</span>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Rating", value: `${job.owner.rating} ⭐` },
                  { label: "Team Size", value: `${job.owner.teamSize} employees` },
                  { label: "Sector", value: job.owner.sector },
                  {
                    label: "Salary",
                    value: `${formatCurrency(job.description.salaryRangeMinYearly)} – ${formatCurrency(job.description.salaryRangeMaxYearly)}`,
                  },
                  { label: "Employment", value: job.description.employmentType },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-400 font-medium">{label}</span>
                    <span className="text-xs font-semibold text-slate-700">{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;