import { useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useAnimation,
  type Variants,
} from "framer-motion";
import { getToken } from "@clerk/react";
import axios from "axios";

import type { Application } from "../types/applicationTracker";
import SkeletonRow from "../components/applicationTracker/SkeletonRow";
import CreateApplicationModal from "../components/applicationTracker/CreateApplicationModal";
import AppRow from "../components/applicationTracker/AppRow";
import StatCard from "../components/applicationTracker/StatCard";
import { useNavigate } from "react-router-dom";
// ── Types ─────────────────────────────────────────────────────────────────────

// ── Apps API ──────────────────────────────────────────────────────────────────
const fetchApps = async () => {
  try {
    const token = await getToken();
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/applications`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (response.status === 200) {
      return response.data.data;
    }
  } catch (error) {
    console.log(error);
  }
};

// ── Constants ─────────────────────────────────────────────────────────────────

const FILTERS = ["all", "applied", "interviewing", "offer", "rejected"];

// ── Framer variants ───────────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1 },
};

const stagger = (delay = 0.07) => ({
  show: { transition: { staggerChildren: delay } },
});

const toastVar: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 28 },
  },
  exit: { opacity: 0, y: 40, scale: 0.95, transition: { duration: 0.22 } },
};

// ── Error State ───────────────────────────────────────────────────────────────
function ErrorState({ onRetry }: { onRetry: () => void }) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      rotate: [0, -8, 8, -5, 5, 0],
      transition: { duration: 0.6, delay: 0.3 },
    });
  }, [controls]);

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="show"
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className="flex flex-col items-center justify-center py-20 px-8 text-center"
    >
      <motion.div animate={controls} className="text-5xl mb-5 select-none">
        ⚡
      </motion.div>

      <motion.h3
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.15 }}
        className="text-lg font-semibold text-slate-800 mb-2 tracking-tight"
      >
        Something went wrong
      </motion.h3>

      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.22 }}
        className="text-sm text-slate-400 mb-8 max-w-xs"
      >
        We couldn't load your applications. Check your connection and try again.
      </motion.p>

      <motion.button
        variants={fadeUp}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 1.04, y: -1 }}
        whileTap={{ scale: 0.97 }}
        onClick={onRetry}
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-colors"
      >
        Try again
      </motion.button>
    </motion.div>
  );
}


// ── Main Component ────────────────────────────────────────────────────────────
export default function ApplicationTracker() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);


  const navigate=useNavigate();
  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchApps(); // async fetch
      
      if(!data){
        setApps([]);
      }else{
      setApps(data); }// ✅ safe inside async
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false); // ✅ safe inside async
    }
  };

  // useEffect
  useEffect(() => {
    load(); // now safe, load runs async
  }, []);
type Status = "applied" | "interviewing" | "offer" | "rejected";

const emptyCounts: Record<Status, number> = {
  applied: 0,
  interviewing: 0,
  offer: 0,
  rejected: 0,
};

let filtered: typeof apps = [];
let counts: Record<Status, number> = { ...emptyCounts };

if (apps?.length > 0) {
  filtered = apps.filter((a) => {
    return (
      activeFilter === "all" ||
      a.status.toLowerCase() === activeFilter
    );
  });

  counts = apps.reduce<Record<Status, number>>((acc, a) => {
    const key = a.status.toLowerCase() as Status;
    acc[key]++;
    return acc;
  }, { ...emptyCounts });
}


   

 

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex font-sans">
      {/* ── Left Panel ── */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="w-72 shrink-0 border-r border-slate-200/60 bg-white/70 backdrop-blur-xl flex flex-col gap-5 p-6 max-h-screen"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg
              className="w-4 h-4 text-white cursor-pointer"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              onClick={()=>navigate('/dashboard')}
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">
              Craftr
            </div>
            <div className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase">
              Job Tracker
            </div>
          </div>
        </div>

        {/* Create button */}
        <motion.button
          whileHover={{
            scale: 1.03,
            y: -2,
            boxShadow: "0 12px 32px rgba(99,102,241,0.4)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 relative overflow-hidden"
        >
          <motion.span
            whileHover={{ rotate: 90 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-base leading-none"
          >
            +
          </motion.span>
          Create Application
        </motion.button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          <StatCard label="Total" value={apps.length} color="text-indigo-600" />
          <StatCard
            label="Interviews"
            value={counts.interviewing}
            color="text-amber-500"
          />
          <StatCard
            label="Offers"
            value={counts.offer}
            color="text-emerald-500"
          />
          <StatCard
            label="Applied"
            value={counts.applied}
            color="text-blue-500"
          />
        </div>

        {/* Resume card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl py-3 px-5 bg-linear-to-br from-indigo-500 via-violet-500 to-purple-600 text-white relative overflow-hidden shadow-lg shadow-indigo-200"
        >
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 right-10 w-16 h-16 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <div className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-widest">
              Resume Match
            </div>
            <div className="text-3xl font-black tracking-tight">
              84%<span className="text-lg font-medium opacity-70"></span>
            </div>
            <div className="text-[11px] opacity-60 mt-0.5 mb-3">
              Top 5% candidate
            </div>
            <motion.button
              whileHover={{
                scale: 1.04,
                backgroundColor: "rgba(255,255,255,0.3)",
              }}
              whileTap={{ scale: 0.96 }}
              className="text-[11px] font-semibold bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 transition-colors backdrop-blur-sm"
            >
              ✦ Optimize CV
            </motion.button>
          </div>
        </motion.div>

        {/* Filter nav */}
        <nav className="flex flex-col gap-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-1">
            Filter
          </div>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f;
            const cnt = f === "all" ? apps.length : counts[f] || 0;
            const dotColors: Record<string, string> = {
              all: "bg-indigo-400",
              applied: "bg-blue-400",
              interviewing: "bg-amber-400",
              offer: "bg-emerald-400",
              rejected: "bg-red-400",
            };

            return (
              <motion.button
                key={f}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveFilter(f)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${dotColors[f]}`} />
                <span className="flex-1 capitalize">
                  {f === "all" ? "All Applications" : f}
                </span>
                <motion.span
                  key={cnt}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {cnt}
                </motion.span>
              </motion.button>
            );
          })}
        </nav>
      </motion.aside>

      {/* ── Right Panel ── */}
      <main className="flex-1 flex flex-col gap-5 p-7 overflow-auto">
        {/* Top bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.1,
            type: "spring",
            stiffness: 260,
            damping: 26,
          }}
          className="flex items-end justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              All Applications
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Track your entire job search pipeline
            </p>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.18,
            type: "spring",
            stiffness: 240,
            damping: 26,
          }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 flex flex-col overflow-hidden flex-1"
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div>
              <div className="text-sm font-semibold text-slate-800">
                Applications
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={filtered.length}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-slate-400 mt-0.5"
                >
                  Showing {filtered.length} of {apps.length}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex gap-1.5">
              {["All", "Recent", "Starred"].map((t) => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all first:bg-slate-100 first:text-slate-700 first:border-slate-200"
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Col headers */}
          {!loading && !error && (
            <div
              className="grid gap-4 px-6 py-2.5 bg-slate-50/80 border-b border-slate-100"
              style={{ gridTemplateColumns: "40px 1fr 130px 90px 70px" }}
            >
              {["", "Role & Company", "Status", "Applied", "Salary"].map(
                (h, i) => (
                  <div
                    key={i}
                    className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest"
                  >
                    {h}
                  </div>
                ),
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} delay={i * 0.06} />
                  ))}
                </motion.div>
              )}

              {!loading && error && (
                <motion.div
                  key="error"
                  variants={scaleIn}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                >
                  <ErrorState onRetry={load} />
                </motion.div>
              )}

              {!loading && !error && filtered.length === 0 && (
                <motion.div
                  key="empty"
                  variants={scaleIn}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-5xl mb-4"
                  >
                    🔍
                  </motion.div>
                  <div className="text-base font-semibold text-slate-700">
                    No applications found
                  </div>
                  <div className="text-sm text-slate-400 mt-1">
                    Try adjusting your search or filter
                  </div>
                </motion.div>
              )}

              {!loading && !error && filtered.length > 0 && (
                <motion.div
                  key="list"
                  variants={stagger(0.055)}
                  initial="hidden"
                  animate="show"
                >
                  <AnimatePresence>
                    {filtered.map((app, i) => (
                      <AppRow key={app.id} app={app} index={i} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

      {/* ── Modal ── */}
      <AnimatePresence>
        {showModal && (
          <CreateApplicationModal
            onClose={() => setShowModal(false)}
            setApps={setApps}
            apps={apps}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            variants={toastVar}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white text-sm font-medium px-4 py-3 rounded-2xl shadow-2xl shadow-slate-900/30"
          >
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.4 }}
              className="w-2 h-2 bg-emerald-400 rounded-full"
            />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
