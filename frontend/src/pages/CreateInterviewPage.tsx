import { getToken } from "@clerk/react";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  type Transition,
  type Variants,
} from "framer-motion";
import { useNavigate } from "react-router-dom";

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

function InterviewCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-md p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div
            {...shimmer}
            className="w-10 h-10 rounded-xl bg-slate-200"
          />
          <div className="space-y-1.5">
            <motion.div
              {...shimmer}
              className="h-3 w-20 bg-slate-200 rounded-full"
            />
            <motion.div
              {...shimmer}
              className="h-2.5 w-14 bg-slate-100 rounded-full"
            />
          </div>
        </div>
        <motion.div
          {...shimmer}
          className="h-5 w-16 bg-slate-200 rounded-full"
        />
      </div>
      <motion.div {...shimmer} className="h-4 w-36 bg-slate-200 rounded-full" />
      <motion.div {...shimmer} className="h-3 w-24 bg-slate-100 rounded-full" />
      <div className="flex gap-2">
        <motion.div
          {...shimmer}
          className="h-5 w-16 bg-slate-100 rounded-full"
        />
        <motion.div
          {...shimmer}
          className="h-5 w-20 bg-slate-100 rounded-full"
        />
      </div>
      <motion.div {...shimmer} className="h-9 w-full bg-slate-200 rounded-xl" />
    </div>
  );
}

// ── Per-card colour palette ───────────────────────────────────────────────────
const CARD_PALETTES = [
  {
    grad: "from-indigo-500 to-violet-600",
    shadow: "shadow-indigo-200",
    blob: "from-indigo-200/50 to-violet-200/30",
    pill: "bg-indigo-50 text-indigo-600 ring-indigo-100",
  },
  {
    grad: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-200",
    blob: "from-emerald-200/50 to-teal-200/30",
    pill: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  {
    grad: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-200",
    blob: "from-amber-200/50 to-orange-200/30",
    pill: "bg-amber-50 text-amber-600 ring-amber-100",
  },
  {
    grad: "from-rose-400 to-pink-500",
    shadow: "shadow-rose-200",
    blob: "from-rose-200/50 to-pink-200/30",
    pill: "bg-rose-50 text-rose-600 ring-rose-100",
  },
  {
    grad: "from-sky-400 to-blue-500",
    shadow: "shadow-sky-200",
    blob: "from-sky-200/50 to-blue-200/30",
    pill: "bg-sky-50 text-sky-600 ring-sky-100",
  },
  {
    grad: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-200",
    blob: "from-violet-200/50 to-purple-200/30",
    pill: "bg-violet-50 text-violet-600 ring-violet-100",
  },
];

// ── Framer variants ───────────────────────────────────────────────────────────
const modalVar: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 30 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2 } },
};

const cardVar: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24 },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value === 0 && type === "number" ? "" : value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 text-slate-800 placeholder:text-slate-300 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-md focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]"
      />
    </div>
  );
}

// ── Create Interview Modal ────────────────────────────────────────────────────
function CreateInterviewModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (interview: Interview) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [role, setRole] = useState("");
  const [duration, setDuration] = useState<number>(0);
  const [interviewType, setInterviewType] = useState("");
  const [experience, setExperience] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };


  
  const handleCreate = async () => {
  try {
    setCreating(true);
    const token = await getToken();
    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/interviews`,
      {
        title,
        domain,
        role,
        durationMinutes: duration,
        interviewType,
        experience,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    
    onCreate(res.data.data);
    onClose();
  } catch (error) {
    console.log(error);
    showToast("Something went wrong. Please try again.");
  } finally {
    setCreating(false);
  }
};
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
    >
      <motion.div
        variants={modalVar}
        initial="hidden"
        animate="show"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-300/40 p-7 relative overflow-hidden"
      >
        {/* Blobs */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-linear-to-br from-indigo-200/40 to-violet-200/30 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-linear-to-br from-emerald-200/30 to-teal-200/20 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="relative mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                New Interview
              </h2>
            </div>
            <p className="text-xs text-slate-400 ml-10">
              Set up your AI-powered practice session
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Fields */}
        <div className="relative grid grid-cols-2 gap-4 mb-5">
          <div className="col-span-2">
            <Field
              label="Interview Title"
              id="title"
              placeholder="e.g. Frontend Round 1…"
              value={title}
              onChange={setTitle}
            />
          </div>
          {/* Domain selector */}
<div className="col-span-2 flex flex-col gap-1.5">
  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Domain</label>
  <div className="flex gap-2 flex-wrap">
    {[
      { t: "TECH",         active: "from-indigo-500 to-violet-600 shadow-indigo-200",  inactive: "hover:border-indigo-300 hover:text-indigo-500" },
      { t: "MARKETING",    active: "from-pink-400 to-rose-500 shadow-rose-200",        inactive: "hover:border-pink-300 hover:text-pink-500" },
      { t: "LAW",          active: "from-amber-400 to-orange-500 shadow-amber-200",    inactive: "hover:border-amber-300 hover:text-amber-500" },
      { t: "COMMERCE",     active: "from-emerald-400 to-teal-500 shadow-emerald-200",  inactive: "hover:border-emerald-300 hover:text-emerald-500" },
      { t: "SOCIAL_SCIENCE", active: "from-sky-400 to-blue-500 shadow-sky-200",        inactive: "hover:border-sky-300 hover:text-sky-500" },
      { t: "HR",           active: "from-violet-500 to-purple-600 shadow-violet-200",  inactive: "hover:border-violet-300 hover:text-violet-500" },
    ].map(({ t, active, inactive }) => (
      <motion.button
        key={t}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
        onClick={() => setDomain(t)}
        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
          domain === t
            ? `bg-linear-to-br ${active} text-white border-transparent shadow-lg`
            : `bg-slate-50 text-slate-500 border-slate-200 ${inactive}`
        }`}
      >
        {t.replace("_", " ")}
      </motion.button>
    ))}
  </div>
</div>
          <Field
            label="Role"
            id="role"
            placeholder="Full Stack, Designer…"
            value={role}
            onChange={setRole}
          />
          <Field
            label="Duration (mins)"
            id="duration"
            type="number"
            placeholder="30"
            value={duration}
            onChange={(v) => setDuration(parseInt(v) || 0)}
          />
          <Field
            label="Experience (yrs)"
            id="exp"
            type="number"
            placeholder="2"
            value={experience}
            onChange={(v) => setExperience(parseInt(v) || 0)}
          />

          {/* Type selector */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Interview Type
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                {
                  t: "HR",
                  active: "from-rose-400 to-pink-500 shadow-rose-200",
                  inactive: "hover:border-rose-300 hover:text-rose-500",
                },
                {
                  t: "Tech",
                  active: "from-indigo-500 to-violet-600 shadow-indigo-200",
                  inactive: "hover:border-indigo-300 hover:text-indigo-500",
                },
                {
                  t: "Behavioural",
                  active: "from-amber-400 to-orange-500 shadow-amber-200",
                  inactive: "hover:border-amber-300 hover:text-amber-500",
                },
                {
                  t: "Case Study",
                  active: "from-emerald-400 to-teal-500 shadow-emerald-200",
                  inactive: "hover:border-emerald-300 hover:text-emerald-500",
                },
                {
                  t: "Theory",
                  active: "from-sky-400 to-blue-500 shadow-sky-200",
                  inactive: "hover:border-sky-300 hover:text-sky-500",
                },
                {
                  t: "Oral / Viva",
                  active: "from-violet-500 to-purple-600 shadow-violet-200",
                  inactive: "hover:border-violet-300 hover:text-violet-500",
                },
              ].map(({ t, active, inactive }) => (
                <motion.button
                  key={t}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setInterviewType(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                    interviewType === t
                      ? `bg-linear-to-br ${active} text-white border-transparent shadow-lg`
                      : `bg-slate-50 text-slate-500 border-slate-200 ${inactive}`
                  }`}
                >
                  {t}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="relative flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{
              scale: 1.03,
              y: -1,
              boxShadow: "0 10px 28px rgba(99,102,241,0.35)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            disabled={creating}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            {creating ? (
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{
                      duration: 0.7,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                    className="w-1.5 h-1.5 rounded-full bg-white/80"
                  />
                ))}
              </div>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create Session
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
  {toast && (
    <motion.div
      initial={{ opacity: 0, y: -40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="fixed top-6 right-6 z-60 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-red-500 text-white text-xs font-semibold shadow-2xl shadow-red-200"
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      {toast}
    </motion.div>
  )}
</AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function CreateInterviewPage() {
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  async function fetchInterviews() {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/interviews`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setInterviews(res.data.interviews);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInterviews();
  }, []);

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
              AI Interviews
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
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 cursor-pointer"
        >
          <motion.span
            whileHover={{ rotate: 90 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-base leading-none"
          >
            +
          </motion.span>
          New Interview
        </motion.button>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            {
              label: "Total",
              value: interviews.length,
              color: "text-indigo-600",
            },
            {
              label: "This Month",
              value: interviews.filter(
                (i) =>
                  new Date(i.createdAt).getMonth() === new Date().getMonth(),
              ).length,
              color: "text-emerald-500",
            },
            {
              label: "Tech",
              value: interviews.filter(
                (i) => i.interviewType?.toLowerCase() === "tech",
              ).length,
              color: "text-violet-500",
            },
            {
              label: "HR",
              value: interviews.filter(
                (i) => i.interviewType?.toLowerCase() === "hr",
              ).length,
              color: "text-rose-500",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-sm px-3 py-3 text-center"
            >
              <div className={`text-xl font-black ${color}`}>{value}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Type breakdown bars */}
        <div className="mt-auto">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-3">
            Type Breakdown
          </div>
          {[
            { t: "Tech", color: "bg-indigo-400" },
            { t: "HR", color: "bg-rose-400" },
            { t: "Behavioural", color: "bg-amber-400" },
            { t: "Case Study", color: "bg-emerald-400" },
          ].map(({ t, color }, i) => {
            const count = interviews.filter(
              (iv) => iv.interviewType?.toLowerCase() === t.toLowerCase(),
            ).length;
            const pct = interviews.length
              ? Math.round((count / interviews.length) * 100)
              : 0;
            return (
              <div key={t} className="flex items-center gap-2 mb-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
                <span className="text-xs text-slate-500 flex-1">{t}</span>
                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      delay: 0.3 + i * 0.1,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full ${color}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-semibold w-4 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </motion.aside>

      {/* ── Main ── */}
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
              AI Interview Sessions
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Practice, prepare, and ace your next interview
            </p>
          </div>
          <div className="flex gap-2">
            {[
              {
                label: "Total",
                value: interviews.length,
                grad: "from-indigo-500 to-violet-600",
                shadow: "shadow-indigo-200",
              },
              {
                label: "This Month",
                value: interviews.filter(
                  (i) =>
                    new Date(i.createdAt).getMonth() === new Date().getMonth(),
                ).length,
                grad: "from-emerald-400 to-teal-500",
                shadow: "shadow-emerald-200",
              },
            ].map(({ label, value, grad, shadow }) => (
              <div
                key={label}
                className={`bg-linear-to-br ${grad} text-white rounded-2xl px-4 py-2 text-center shadow-lg ${shadow}`}
              >
                <div className="text-xl font-black leading-none">{value}</div>
                <div className="text-[10px] font-semibold opacity-80 uppercase tracking-wider mt-0.5">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card panel */}
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
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="text-sm font-semibold text-slate-800">
                Your Sessions
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={interviews.length}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-slate-400"
              >
                {interviews.length} session{interviews.length !== 1 ? "s" : ""}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InterviewCardSkeleton key={i} />
                  ))}
                </motion.div>
              )}

              {!loading && interviews.length === 0 && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
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
                    🎙️
                  </motion.div>
                  <div className="text-base font-semibold text-slate-700">
                    No sessions yet
                  </div>
                  <div className="text-sm text-slate-400 mt-1 mb-6">
                    Create your first AI interview session to get started
                  </div>
                  <motion.button
                    whileHover={{
                      scale: 1.04,
                      y: -1,
                      boxShadow: "0 10px 28px rgba(99,102,241,0.3)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2.5 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 cursor-pointer"
                  >
                    + Create First Session
                  </motion.button>
                </motion.div>
              )}

              {!loading && interviews.length > 0 && (
                <motion.div
                  key="grid"
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.07 } } }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                  <AnimatePresence>
                    {interviews.map((interview, idx) => {
                      const p = CARD_PALETTES[idx % CARD_PALETTES.length];
                      const initials =
                        interview.domain?.slice(0, 2).toUpperCase() || "??";
                      return (
                        <motion.div
                          key={interview.id}
                          variants={cardVar}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          whileHover={{
                            y: -4,
                            boxShadow: "0 20px 48px rgba(0,0,0,0.08)",
                          }}
                          className="relative bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-md p-5 flex flex-col gap-4 overflow-hidden group cursor-default"
                        >
                          {/* Blob */}
                          <div
                            className={`absolute -top-10 -right-10 w-36 h-36 rounded-full bg-linear-to-br ${p.blob} blur-2xl pointer-events-none`}
                          />
                          {/* Bottom accent */}
                          <div
                            className={`absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-linear-to-r ${p.grad} opacity-30`}
                          />

                          {/* Top row */}
                          <div className="flex items-start justify-between gap-2 relative">
                            <div className="flex items-center gap-2.5">
                              <motion.div
                                whileHover={{ scale: 1.12, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className={`w-10 h-10 rounded-xl bg-linear-to-br ${p.grad} flex items-center justify-center text-xs font-black text-white shadow-lg ${p.shadow} shrink-0`}
                              >
                                {initials}
                              </motion.div>
                              <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {interview.domain}
                                </div>
                                <div className="text-[10px] text-slate-300 font-medium mt-0.5">
                                  {interview.createdAt.slice(0, 10)}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 shrink-0 ${p.pill}`}
                            >
                              {interview.interviewType}
                            </span>
                          </div>

                          {/* Title & role */}
                          <div className="relative">
                            <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors duration-200">
                              {interview.title}
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              {interview.role}
                            </p>
                          </div>

                          {/* Meta chips */}
                          <div className="flex flex-wrap gap-1.5 relative">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ring-1 ${p.pill}`}
                            >
                              ⏱ {interview.durationMinutes} min
                            </span>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/60">
                              🎯 {interview.experience} yr
                              {interview.experience !== 1 ? "s" : ""} exp
                            </span>
                          </div>

                          {/* CTA */}
                          <motion.button
                            whileHover={{
                              scale: 1.03,
                              y: -1,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                            }}
                            whileTap={{ scale: 0.97 }}
                            className={`relative w-full py-2.5 rounded-xl bg-linear-to-br ${p.grad} text-white text-xs font-bold shadow-md ${p.shadow} transition-all duration-200 cursor-pointer`}
                            onClick={()=>navigate(`${interview.id}`)}
                          >
                            Start Session →
                          </motion.button>
                        </motion.div>
                      );
                    })}
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
          <CreateInterviewModal
            onClose={() => setShowModal(false)}
            onCreate={(interview) =>
              setInterviews((prev) => [interview, ...prev])
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default CreateInterviewPage;
