import { fetchJobs } from "../data/job";

export function startJobsScheduler() {
  // ✅ Run immediately when server starts
  fetchJobs();
  // ✅ Then run every 1 hour
  setInterval(
    () => {
      console.log("Running scheduled job...");
      fetchJobs();
    },
    60 * 60 * 1000,
  );
}
