import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "../components/Navbar";
import type { Job } from "../types/job";
import axios from "axios";
import JobCard from "../components/JobCard";
import { motion, AnimatePresence } from "framer-motion";

function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [input, setInput] = useState<string>("");
  const [isSearchMode, setIsSearchMode] = useState<boolean>(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const fetchJobs = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/jobs?pageNo=${currentPage}`
      );
      const data = response.data.jobs;
      if (data.length === 0) {
        setHasMore(false);
      } else {
        setJobs((prev) => (currentPage === 1 ? data : [...prev, ...data]));
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  }, []);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || isSearchMode) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) fetchJobs(page);
      });
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, page, fetchJobs, isSearchMode]
  );

  async function handleSearch() {
    if (!input.trim()) { handleClearSearch(); return; }
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/jobs/search?search=${input}`
      );
      setJobs(res.data.jobs);
      setIsSearchMode(true);
      setHasMore(false);
    } catch (error) {
      alert("Error searching");
      console.error(error);
    }
    setLoading(false);
  }

  function handleClearSearch() {
    setInput(""); setJobs([]); setPage(1);
    setHasMore(true); setIsSearchMode(false); fetchJobs(1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  useEffect(() => { fetchJobs(1); }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="relative text-center space-y-4 py-8 overflow-hidden"
        >
          {/* Background blobs */}
          <div className="absolute -top-10 -left-16 w-56 h-56 rounded-full bg-linear-to-br from-indigo-200/40 to-violet-200/30 blur-3xl pointer-events-none" />
          <div className="absolute -top-6 -right-16 w-48 h-48 rounded-full bg-linear-to-br from-emerald-200/30 to-teal-200/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 rounded-full bg-linear-to-br from-amber-200/20 to-orange-200/10 blur-2xl pointer-events-none" />

          {/* Live badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 300, damping: 22 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-600 uppercase tracking-widest"
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            />
            {isSearchMode ? `${jobs.length} results found` : "10,000+ Jobs Listed"}
          </motion.div>

          <h1 className="relative text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Explore{" "}
            <span className="bg-linear-to-r from-indigo-500 via-violet-500 to-purple-600 bg-clip-text text-transparent">
              Opportunities
            </span>
          </h1>
          <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            Search and discover your next career opportunity from thousands of curated listings.
          </p>

          {/* Search bar */}
          <div className="relative mt-2 flex justify-center gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none"
                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <motion.input
                whileFocus={{ boxShadow: "0 0 0 3px rgba(99,102,241,0.12)" }}
                type="text"
                placeholder="Search by title, skill, or company..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-800 bg-white/80 backdrop-blur-sm placeholder:text-slate-300 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                value={input}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.03, y: -1, boxShadow: "0 10px 28px rgba(99,102,241,0.35)" }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSearch}
              className="px-5 py-3 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              Search
            </motion.button>

            <AnimatePresence>
              {isSearchMode && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClearSearch}
                  className="px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 cursor-pointer"
                >
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Quick filter chips */}
          <AnimatePresence>
            {!isSearchMode && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap justify-center gap-2 pt-1"
              >
                {[
                  { label: "Remote", color: "bg-indigo-50 text-indigo-500 ring-1 ring-indigo-100" },
                  { label: "Full-time", color: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" },
                  { label: "Engineering", color: "bg-violet-50 text-violet-500 ring-1 ring-violet-100" },
                  { label: "Design", color: "bg-amber-50 text-amber-500 ring-1 ring-amber-100" },
                  { label: "Marketing", color: "bg-rose-50 text-rose-500 ring-1 ring-rose-100" },
                ].map(({ label, color }) => (
                  <motion.button
                    key={label}
                    whileHover={{ scale: 1.07, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setInput(label); }}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${color}`}
                  >
                    {label}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      

        {/* Jobs Grid */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {jobs.map((job, index) => {
            const isLast = index === jobs.length - 1;
            return (
              <motion.div
                key={job._id}
                ref={isLast ? lastElementRef : null}
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
                }}
              >
                <JobCard job={job} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Empty state */}
        <AnimatePresence>
          {!loading && jobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl mb-4"
              >
                🔍
              </motion.div>
              <div className="text-base font-semibold text-slate-700">No jobs found</div>
              <div className="text-sm text-slate-400 mt-1">
                {isSearchMode ? `No results for "${input}"` : "Check back later for new listings"}
              </div>
              {isSearchMode && (
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClearSearch}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold shadow-lg shadow-indigo-200"
                >
                  Clear Search
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading dots — multicolour */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2.5 py-6"
            >
              <div className="flex gap-1.5">
                {["bg-indigo-400", "bg-violet-400", "bg-emerald-400"].map((color, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    className={`w-2.5 h-2.5 rounded-full ${color}`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-400 font-medium">
                {isSearchMode ? "Searching..." : "Loading more jobs..."}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* End of list */}
        <AnimatePresence>
          {!hasMore && !isSearchMode && jobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 justify-center py-4"
            >
              <div className="h-px flex-1 bg-linear-to-r from-transparent via-slate-200 to-transparent max-w-32" />
              <span className="text-xs text-slate-400 font-semibold tracking-widest uppercase">
                You've reached the end
              </span>
              <div className="h-px flex-1 bg-linear-to-r from-transparent via-slate-200 to-transparent max-w-32" />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

export default JobsPage;