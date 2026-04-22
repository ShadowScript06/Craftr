import { getToken } from "@clerk/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  type Transition,
  type Variants,
} from "framer-motion";

interface Interview {
  id: string;
  userId: string;
  title: string;
  domain: string;
  role: string;
  experience: number;
  durationMinutes: number;
  interviewType: string;
  codingEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  sessionId: string;
  userId: string;
  interviewId: string;
  attempt: number;
  status: string;
  createdAt: string;
  endedAt: string;
  difficulty: string;
}

interface SessionResult {
  id: string;
  sessionId: string;
  score: number;
  rating: string;
  correctCount: string;
  totalCount: string;
  feedback: string;
  strengths: string;
  weaknesses: string;
  timetaken: string;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const shimmerTransition: Transition = {
  duration: 1.4,
  repeat: Infinity,
  ease: "easeInOut",
};
const shimmer = {
  animate: { opacity: [0.4, 0.9, 0.4] },
  transition: shimmerTransition,
};

function InterviewDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7">
        <div className="flex items-center gap-3 mb-5">
          <motion.div
            {...shimmer}
            className="w-12 h-12 rounded-2xl bg-slate-200"
          />
          <div className="space-y-2">
            <motion.div
              {...shimmer}
              className="h-3 w-28 bg-slate-200 rounded-full"
            />
            <motion.div
              {...shimmer}
              className="h-2.5 w-20 bg-slate-100 rounded-full"
            />
          </div>
        </div>
        <motion.div
          {...shimmer}
          className="h-8 w-64 bg-slate-200 rounded-xl mb-4"
        />
        <div className="flex gap-2 flex-wrap mb-6">
          <motion.div
            {...shimmer}
            className="h-6 w-20 bg-slate-200 rounded-full"
          />
          <motion.div
            {...shimmer}
            className="h-6 w-24 bg-slate-100 rounded-full"
          />
          <motion.div
            {...shimmer}
            className="h-6 w-16 bg-slate-100 rounded-full"
          />
        </div>
        <div className="flex gap-3">
          <motion.div
            {...shimmer}
            className="h-10 w-32 bg-slate-200 rounded-xl"
          />
        </div>
      </div>

      {/* Sessions card */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden">
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <motion.div
            {...shimmer}
            className="h-4 w-32 bg-slate-200 rounded-full"
          />
          <motion.div
            {...shimmer}
            className="h-3 w-20 bg-slate-100 rounded-full"
          />
        </div>
        <div className="px-7 py-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              {...shimmer}
              className="h-20 w-full bg-slate-100 rounded-2xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Difficulty colours ────────────────────────────────────────────────────────
const DIFFICULTY_CONFIG: Record<string, { pill: string; grad: string }> = {
  easy: {
    pill: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    grad: "from-emerald-400 to-teal-500",
  },
  medium: {
    pill: "bg-amber-50 text-amber-600 ring-amber-100",
    grad: "from-amber-400 to-orange-500",
  },
  hard: {
    pill: "bg-red-50 text-red-500 ring-red-100",
    grad: "from-red-400 to-rose-500",
  },
};

// ── Status colours ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  ongoing: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  failed: "bg-red-50 text-red-500 ring-red-100",
  pending: "bg-slate-100 text-slate-500 ring-slate-200",
};

// ── Session card palettes (cycles) ────────────────────────────────────────────
const SESSION_PALETTES = [
  {
    grad: "from-indigo-500 to-violet-600",
    shadow: "shadow-indigo-200",
    blob: "from-indigo-200/40 to-violet-200/20",
  },
  {
    grad: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200",
    blob: "from-emerald-200/40 to-teal-200/20",
  },
  {
    grad: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-200",
    blob: "from-amber-200/40 to-orange-200/20",
  },
  {
    grad: "from-rose-400 to-pink-500",
    shadow: "shadow-rose-200",
    blob: "from-rose-200/40 to-pink-200/20",
  },
  {
    grad: "from-sky-400 to-blue-500",
    shadow: "shadow-sky-200",
    blob: "from-sky-200/40 to-blue-200/20",
  },
];

// ── Framer variants ───────────────────────────────────────────────────────────


const toastVar: Variants = {
  hidden: { opacity: 0, y: -40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
  exit: { opacity: 0, y: -40, transition: { duration: 0.2 } },
};

// ── Main ──────────────────────────────────────────────────────────────────────
export default function InterviewDetail() {
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isCreatingSession, setCreatingSession] = useState<boolean>(false);
  const [isRetryingSession, setRetryingSession] = useState<boolean>(false);
  const [isEndingSession, setEndingSession] = useState<boolean>(false);
  const [isDeletingSession, setDeletingSession] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<string>("easy");
  const [toast, setToast] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<SessionResult | null>(
    null,
  );
  const [isResultOpen, setIsResultOpen] = useState<boolean>(false);
  const [isFetchingResult, setIsFetchingResult] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

 
  async function fetchInterview() {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/interviews/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.data.interview;
    } catch (error) {
      console.log(error);
    }
  }

  async function fetchSessions() {
    try {
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/interviews/${id}/sessions`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.data.data;
    } catch (error) {
      console.log(error);
    } finally {
      setCreatingSession(false);
    }
  }

  async function handleStartSession() {
    try {
      setCreatingSession(true);
      const token = await getToken();
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/interviews/${id}/sessions/start`,
        { difficulty },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = res.data.data;
      navigate(`session/${data.sessionId}`);
    } catch (error) {
      console.log(error);
      showToast("Failed to create session. Please try again.");
      setCreatingSession(false);
    }
  }

  async function handleDeleteSession(sessionId: string) {
    try {
      setDeletingSession(true);
      const token = await getToken();
       await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/interviews/${id}/sessions/${sessionId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const filtered = sessions.filter((session) => {
        return session.sessionId !== sessionId;
      });

      setSessions(filtered);

      showToast(`Session : ${sessionId} deleted succesfully.`)
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingSession(false);
    }
  }

  async function handleRetrySession(sessionId: string) {
    try {
      setRetryingSession(true);
      const token = await getToken();
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/interviews/${id}/sessions/${sessionId}/retry`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const data = res.data.data;
      console.log(data);
      navigate(`session/${data.sessionId}`);
    } catch (error) {
      console.log(error);
    } finally {
      setRetryingSession(false);
    }
  }

  async function handleEndSession(sessionId: string) {
    try {
      setEndingSession(true);
      const token = await getToken();
       await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/interviews/${id}/sessions/${sessionId}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast("Session ended.");

      const newArray=sessions.map((session)=>{
        if(session.sessionId===sessionId){
            return {...session,status:"COMPLETED"}
        }else{
            return session;
        }
      });

      setSessions(newArray);


    } catch (error) {
      console.log(error);
    } finally {
      setEndingSession(false);
    }
  }

  async function handleViewResult(sessionId: string) {
    try {
      setIsFetchingResult(true);
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/interviews/${id}/sessions/${sessionId}/result`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setSelectedResult(res.data.data);
      setIsResultOpen(true);
    } catch (error) {
      console.log(error);
      showToast("Failed to fetch result");
    } finally {
      setIsFetchingResult(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [interviewData, sessionsData] = await Promise.all([
          fetchInterview(),
          fetchSessions(),
        ]);
        setInterview(interviewData);
        setSessions(sessionsData);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Creating session overlay ──
  if (isCreatingSession)
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex gap-2">
            {["bg-indigo-400", "bg-violet-400", "bg-emerald-400"].map(
              (c, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className={`w-3 h-3 rounded-full ${c}`}
                />
              ),
            )}
          </div>
          <p className="text-sm font-semibold text-slate-400">
            Creating Session…
          </p>
        </motion.div>
      </div>
    );

  // ── Retry session overlay ──
  if (isRetryingSession)
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex gap-2">
            {["bg-indigo-400", "bg-violet-400", "bg-emerald-400"].map(
              (c, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className={`w-3 h-3 rounded-full ${c}`}
                />
              ),
            )}
          </div>
          <p className="text-sm font-semibold text-slate-400">
            Retrying Session…
          </p>
        </motion.div>
      </div>
    );

  // ── Ending session overlay ──
  if (isEndingSession)
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex gap-2">
            {["bg-indigo-400", "bg-violet-400", "bg-emerald-400"].map(
              (c, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className={`w-3 h-3 rounded-full ${c}`}
                />
              ),
            )}
          </div>
          <p className="text-sm font-semibold text-slate-400">
            Ending Session…
          </p>
        </motion.div>
      </div>
    );

  // ── fetching Result overlay ──
  if (isFetchingResult)
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex gap-2">
            {["bg-indigo-400", "bg-violet-400", "bg-emerald-400"].map(
              (c, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className={`w-3 h-3 rounded-full ${c}`}
                />
              ),
            )}
          </div>
          <p className="text-sm font-semibold text-slate-400">
            Fetching Result
          </p>
        </motion.div>
      </div>
    );

  // ── fetching Result overlay ──
  if (isDeletingSession)
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex gap-2">
            {["bg-indigo-400", "bg-violet-400", "bg-emerald-400"].map(
              (c, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className={`w-3 h-3 rounded-full ${c}`}
                />
              ),
            )}
          </div>
          <p className="text-sm font-semibold text-slate-400">
            Deleting Session...
          </p>
        </motion.div>
      </div>
    );

  // ── No interview ──
  if (!interview && !loading)
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex flex-col items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-5xl mb-4"
          >
            🔍
          </motion.div>
          <div className="text-base font-semibold text-slate-700">
            No interview found
          </div>
          <div className="text-sm text-slate-400 mt-1 mb-6">
            This session may have been removed.
          </div>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 cursor-pointer"
          >
            ← Go Back
          </motion.button>
        </motion.div>
      </div>
    );

  const diffConfig = DIFFICULTY_CONFIG[difficulty] ?? DIFFICULTY_CONFIG.easy;
  const initials = interview?.domain?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex font-sans">
      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="w-72 shrink-0 border-r border-slate-200/60 bg-white/70 backdrop-blur-xl flex flex-col gap-5 p-6 max-h-screen sticky top-0"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div
            className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">
              Craftr
            </div>
            <div className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase">
              AI Tests
            </div>
          </div>
        </div>

        {/* Difficulty selector */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
            Select Difficulty
          </div>
          {["easy", "medium", "hard"].map((d) => {
            const cfg = DIFFICULTY_CONFIG[d];
            const isActive = difficulty === d;
            return (
              <motion.button
                key={d}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDifficulty(d)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? `bg-linear-to-br ${cfg.grad} text-white shadow-md`
                    : "text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${isActive ? "bg-white/70" : "bg-slate-300"}`}
                />
                <span className="capitalize flex-1 text-left">{d}</span>
                {isActive && (
                  <svg
                    className="w-3.5 h-3.5 opacity-80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            {
              label: "Sessions",
              value: sessions.length,
              color: "text-indigo-600",
            },
            {
              label: "Completed",
              value: sessions.filter(
                (s) => s.status?.toLowerCase() === "completed",
              ).length,
              color: "text-emerald-500",
            },
            {
              label: "Duration",
              value: `${interview?.durationMinutes ?? 0}m`,
              color: "text-amber-500",
            },
            {
              label: "Exp",
              value: `${interview?.experience ?? 0}yr`,
              color: "text-violet-500",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-sm px-3 py-3 text-center"
            >
              <div className={`text-lg font-black ${color}`}>{value}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Start session button */}
        <div className="mt-auto">
          <motion.button
            whileHover={{
              scale: 1.03,
              y: -2,
              boxShadow: "0 12px 32px rgba(99,102,241,0.4)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartSession}
            className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-linear-to-br ${diffConfig.grad} text-white text-sm font-semibold shadow-lg transition-all cursor-pointer`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Start {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}{" "}
            Session
          </motion.button>
        </div>
      </motion.aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-auto">
        {/* Top nav bar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.05,
            type: "spring",
            stiffness: 260,
            damping: 26,
          }}
          className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/60"
        >
          <div className="flex items-center gap-3" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              AI
            </div>
          </div>
        </motion.div>

        <div className="px-8 py-7 max-w-3xl mx-auto">
          {/* Back */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ x: -3 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors mb-6"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" d="M19 12H5m7-7-7 7 7 7" />
            </svg>
            Back to Tests
          </motion.button>

          {loading ? (
            <InterviewDetailSkeleton />
          ) : (
            <>
              {/* ── Interview Header Card ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.13,
                  type: "spring",
                  stiffness: 260,
                  damping: 26,
                }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7 mb-6"
              >
                {/* Domain row */}
                <div className="flex items-center gap-2.5 mb-4">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: 4 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-indigo-200"
                  >
                    {initials}
                  </motion.div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="uppercase tracking-wider">
                      {interview?.domain}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400 font-normal">
                      Created {interview?.createdAt.slice(0, 10)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-4">
                  {interview?.title}
                </h1>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  {[
                    {
                      label: interview?.interviewType,
                      colors: "bg-indigo-50 text-indigo-500 ring-indigo-100",
                    },
                    {
                      label: interview?.role,
                      colors: "bg-violet-50 text-violet-500 ring-violet-100",
                    },
                    {
                      label: `${interview?.experience} yrs exp`,
                      colors: "bg-amber-50 text-amber-500 ring-amber-100",
                    },
                    {
                      label: `${interview?.durationMinutes} min`,
                      colors: "bg-emerald-50 text-emerald-600 ring-emerald-100",
                    },
                    interview?.codingEnabled
                      ? {
                          label: "Coding Enabled",
                          colors: "bg-sky-50 text-sky-500 ring-sky-100",
                        }
                      : null,
                  ]
                    .filter(Boolean)
                    .map((badge) => (
                      <span
                        key={badge!.label}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ring-1 ${badge!.colors}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                        {badge!.label}
                      </span>
                    ))}
                </div>

                {/* Difficulty + Start */}
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {["easy", "medium", "hard"].map((d) => {
                      const cfg = DIFFICULTY_CONFIG[d];
                      return (
                        <motion.button
                          key={d}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setDifficulty(d)}
                          className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-200 cursor-pointer capitalize ${
                            difficulty === d
                              ? `bg-linear-to-br ${cfg.grad} text-white border-transparent shadow-md`
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {d}
                        </motion.button>
                      );
                    })}
                  </div>

                  <motion.button
                    whileHover={{
                      scale: 1.04,
                      y: -1,
                      boxShadow: "0 10px 28px rgba(99,102,241,0.35)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStartSession}
                    className={`ml-auto px-5 py-2.5 rounded-xl bg-linear-to-br ${diffConfig.grad} text-white text-xs font-bold shadow-lg transition-all cursor-pointer flex items-center gap-2`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    Start Session
                  </motion.button>
                </div>
              </motion.div>

              {/* ── Sessions Card ── */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 240,
                  damping: 26,
                }}
                className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <svg
                      className="w-4 h-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                    <span className="text-sm font-semibold text-slate-800">
                      Past Sessions
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    />
                    {sessions.length} session{sessions.length !== 1 ? "s" : ""}
                  </div>
                </div>

                {/* Sessions list */}
                <div className="px-7 py-6">
                  <AnimatePresence>
                    {sessions.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center py-12 text-center"
                      >
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2.5, repeat: Infinity }}
                          className="text-4xl mb-3"
                        >
                          🎙️
                        </motion.div>
                        <div className="text-sm font-semibold text-slate-600">
                          No sessions yet
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Start your first session above
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                      show: { transition: { staggerChildren: 0.08 } },
                    }}
                    className="space-y-4"
                  >
                    <AnimatePresence>
                      {sessions.map((session, idx) => {
                        const p =
                          SESSION_PALETTES[idx % SESSION_PALETTES.length];

                        const statusColor =
                          STATUS_CONFIG[session.status?.toLowerCase()] ??
                          STATUS_CONFIG.pending;

                        const isOngoing = session.status === "IN_PROGRESS";
                        const isCompleted = session.status === "COMPLETED";
                        
                        return (
                          <div
                            key={session.sessionId}
                            className="flex flex-col gap-3"
                          >
                            {/* 🔹 SESSION CARD */}
                            <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col gap-3">
                              {/* Top Info */}
                              <div className="flex justify-between items-center">
                                <div className="text-sm font-semibold text-slate-700">
                                  Attempt #{session.attempt}
                                </div>

                                <div className="flex items-center gap-2">
                                  <div
                                    className={`text-[10px] px-2 py-1 rounded-full font-bold ${statusColor}`}
                                  >
                                    {session.status}
                                  </div>

                                  {/* 🗑 Delete Button */}
                                  <button
                                    onClick={() =>
                                      handleDeleteSession(session.sessionId)
                                    }
                                    className="p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth={2}
                                      stroke="currentColor"
                                      className="w-4 h-4 text-red-400 hover:text-red-600"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-8 0l1 12a1 1 0 001 1h4a1 1 0 001-1l1-12"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              {/* Middle Info */}
                              <div className="flex justify-between text-xs text-slate-500">
                                <span>
                                  {new Date(
                                    session.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>

                              {/* Duration Info (if completed) */}
                              {isCompleted && session.endedAt && (
                                <div className="text-xs text-slate-400">
                                  Duration:{" "}
                                  {Math.floor(
                                    (new Date(session.endedAt).getTime() -
                                      new Date(session.createdAt).getTime()) /
                                      60000,
                                  )}{" "}
                                  mins
                                </div>
                              )}

                              {/* Buttons */}
                              <div className="flex gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.03, y: -1 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() =>
                                    isOngoing
                                      ? handleEndSession(session.sessionId)
                                      : handleRetrySession(session.sessionId)
                                  }
                                  className={`flex-1 py-2 rounded-xl text-white text-xs font-bold shadow-md ${p.shadow} transition-all cursor-pointer ${
                                    isOngoing
                                      ? "bg-linear-to-br from-red-400 to-rose-500"
                                      : `bg-linear-to-br ${p.grad}`
                                  }`}
                                >
                                  {isOngoing
                                    ? "End Session →"
                                    : "Retry Session →"}
                                </motion.button>

                                {isCompleted && (
                                  <motion.button
                                    whileHover={{ scale: 1.03, y: -1 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() =>
                                      handleViewResult(session.sessionId)
                                    }
                                    className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                                  >
                                    See Result
                                  </motion.button>
                                )}
                              </div>
                            </div>

                            {/* 🔻 Separator */}
                            {idx !== sessions.length - 1 && (
                              <div className="h-1 bg-linear-to-r from-transparent via-slate-200 to-transparent my-2" />
                            )}
                          </div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </main>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            variants={toastVar}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-red-500 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl shadow-red-200"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {isResultOpen && selectedResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-slate-800">
                  Session Result
                </h2>
                <button
                  onClick={() => setIsResultOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Score</span>
                  <span className="font-bold text-indigo-600">
                    {selectedResult.score}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Rating</span>
                  <span className="font-semibold">{selectedResult.rating}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Correct</span>
                  <span>
                    {selectedResult.correctCount}/{selectedResult.totalCount}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 text-xs">Feedback</span>
                  <p className="text-slate-700 mt-1">
                    {selectedResult.feedback}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 text-xs">Strengths</span>
                  <p className="text-emerald-600 mt-1">
                    {selectedResult.strengths}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 text-xs">Weaknesses</span>
                  <p className="text-red-500 mt-1">
                    {selectedResult.weaknesses}
                  </p>
                </div>

                
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
