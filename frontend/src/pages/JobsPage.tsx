import { useEffect, useState, useRef, useCallback } from "react";
import Navbar from "../components/Navbar";
import type { Job } from "../types/job";
import axios from "axios";
import JobCard from "../components/JobCard";

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
  }, []); // ✅ No hasMore dependency — avoids stale closure bugs

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || isSearchMode) return; // ✅ Disable infinite scroll during search
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchJobs(page);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore, page, fetchJobs, isSearchMode]
  );

  async function handleSearch() {
    if (!input.trim()) {
      handleClearSearch(); // ✅ If input is empty, reset to paginated view
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/jobs/search?search=${input}`
      );
      setJobs(res.data.jobs);
      setIsSearchMode(true);  // ✅ Flag that we're in search mode
      setHasMore(false);      // ✅ Disable infinite scroll while searching
    } catch (error) {
      alert("Error searching");
      console.error(error);
    }
    setLoading(false);
  }

  function handleClearSearch() {
    setInput("");
    setJobs([]);
    setPage(1);
    setHasMore(true);         // ✅ Re-enable infinite scroll
    setIsSearchMode(false);   // ✅ Exit search mode
    fetchJobs(1);             // ✅ Reload paginated jobs from scratch
  }

  // ✅ Handle Enter key for search
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  useEffect(() => {
    fetchJobs(1);
  }, []); // ✅ Only run once on mount

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Header & Search */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Explore Jobs
          </h1>
          <p className="text-gray-600">
            Search and discover your next career opportunity
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <input
              type="text"
              placeholder="Search jobs by title..."
              className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              value={input}
            />
            <button
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer px-6 rounded-xl transition"
              onClick={handleSearch}
            >
              Search
            </button>
            {/* ✅ Clear button only visible in search mode */}
            {isSearchMode && (
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer px-4 rounded-xl transition"
                onClick={handleClearSearch}
              >
                Clear
              </button>
            )}
          </div>

          {/* ✅ Search results count */}
          {isSearchMode && (
            <p className="text-sm text-gray-500">
              {jobs.length} result{jobs.length !== 1 ? "s" : ""} for "{input}"
            </p>
          )}
        </div>

        {/* Jobs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job, index) => {
            const isLast = index === jobs.length - 1;
            return (
              <div ref={isLast ? lastElementRef : null} key={job._id}>
                <JobCard job={job} />
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {!loading && jobs.length === 0 && (
          <div className="text-center text-gray-400 font-medium py-8">
            No jobs found{isSearchMode ? ` for "${input}"` : ""}.
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="text-center text-gray-500 font-medium py-4">
            {isSearchMode ? "Searching..." : "Loading more jobs..."}
          </div>
        )}

        {/* End of paginated list */}
        {!hasMore && !isSearchMode && jobs.length > 0 && (
          <div className="text-center text-gray-400 font-medium py-4">
            You've reached the end of the job listings
          </div>
        )}
      </div>
    </div>
  );
}

export default JobsPage;