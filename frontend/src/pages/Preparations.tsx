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

// ── Types ─────────────────────────────────────────────────────────────────────
interface Session {
  id: string;
  userId: string;
  role: string;
  experience: number;
  description: string;
  createdAt: string;
  topicsToFocus?: string[];
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

function SessionCardSkeleton() {
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
              className="h-3 w-24 bg-slate-200 rounded-full"
            />
            <motion.div
              {...shimmer}
              className="h-2.5 w-16 bg-slate-100 rounded-full"
            />
          </div>
        </div>
        <motion.div
          {...shimmer}
          className="h-5 w-14 bg-slate-200 rounded-full"
        />
      </div>
      <motion.div
        {...shimmer}
        className="h-3 w-full bg-slate-100 rounded-full"
      />
      <motion.div
        {...shimmer}
        className="h-3 w-3/4 bg-slate-100 rounded-full"
      />
      <div className="flex gap-2 flex-wrap">
        <motion.div
          {...shimmer}
          className="h-5 w-16 bg-slate-100 rounded-full"
        />
        <motion.div
          {...shimmer}
          className="h-5 w-20 bg-slate-100 rounded-full"
        />
        <motion.div
          {...shimmer}
          className="h-5 w-12 bg-slate-100 rounded-full"
        />
      </div>
      <motion.div {...shimmer} className="h-9 w-full bg-slate-200 rounded-xl" />
    </div>
  );
}

// ── Card palettes ─────────────────────────────────────────────────────────────
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

const toastVar: Variants = {
  hidden: { opacity: 0, y: -40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
  exit: { opacity: 0, y: -40, transition: { duration: 0.2 } },
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

// ── Create Session Modal ──────────────────────────────────────────────────────
function CreateSessionModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (session: Session) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [topicsInput, setTopicsInput] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = async () => {
    if (!role.trim() || !description.trim()) {
      showToast("Please fill in all required fields.");
      return;
    }
    try {
      setCreating(true);
      const token = await getToken();
      const topicsToFocus = topicsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/preparations/sessions`,
        { role, experience, description, topicsToFocus },
        { headers: { Authorization: `Bearer ${token}` } },
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

  if (creating)
  return (
    <div className="fixed inset-0 z-100 bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center font-sans">
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


    

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
    >
      {/* Toast inside modal — fixed top right */}
      <AnimatePresence>
        {toast && (
          <motion.div
            variants={toastVar}
            initial="hidden"
            animate="show"
            exit="exit"
            className="fixed top-6 right-6 z-[60] flex items-center gap-2.5 bg-red-500 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl shadow-red-200"
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
                New Prep Session
              </h2>
            </div>
            <p className="text-xs text-slate-400 ml-10">
              Set up your personalised preparation plan
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
              label="Role"
              id="role"
              placeholder="e.g. Frontend Developer, CA…"
              value={role}
              onChange={setRole}
            />
          </div>
          <div className="col-span-2">
            <Field
              label="Experience (yrs)"
              id="exp"
              type="number"
              placeholder="2"
              value={experience}
              onChange={(v) => setExperience(parseInt(v) || 0)}
            />
          </div>

          {/* Description */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="desc"
              className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
            >
              Description
            </label>
            <motion.textarea
              id="desc"
              whileFocus={{ boxShadow: "0 0 0 3px rgba(99,102,241,0.12)" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What do you want to prepare for? Describe your goal…"
              className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 text-slate-800 placeholder:text-slate-300 shadow-sm resize-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]"
            />
          </div>

          {/* Topics */}
          <div className="col-span-2 flex flex-col gap-1.5">
            <label
              htmlFor="topics"
              className="text-[11px] font-bold text-slate-400 uppercase tracking-widest"
            >
              Topics to Focus
              <span className="ml-1.5 normal-case font-normal text-slate-300">
                (comma separated)
              </span>
            </label>
            <input
              id="topics"
              type="text"
              placeholder="e.g. React, System Design, DSA, Async JS…"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 text-slate-800 placeholder:text-slate-300 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-md focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]"
            />
            {/* Live topic preview chips */}
            {topicsInput.trim() && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {topicsInput
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-500 ring-1 ring-indigo-100"
                    >
                      {t}
                    </span>
                  ))}
              </div>
            )}
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
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function Preparations() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  async function fetchSessions() {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/preparations/sessions`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSessions(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSessions();
  }, []);

  const thisMonth = sessions.filter(
    (s) => new Date(s.createdAt).getMonth() === new Date().getMonth(),
  ).length;

  async function handleDelete(sessionId: string) {
    try {
      setDeletingId(sessionId);

      const token = await getToken();

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/preparations/sessions/${sessionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingId(null);
    }
  }

  if (deletingId)
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
              Preparations
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
          New Prep Session
        </motion.button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            {
              label: "Total",
              value: sessions.length,
              color: "text-indigo-600",
            },
            {
              label: "This Month",
              value: thisMonth,
              color: "text-emerald-500",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="col-span-1 bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-sm px-3 py-3 text-center"
            >
              <div className={`text-xl font-black ${color}`}>{value}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* linear promo card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl py-4 px-5 bg-linear-to-br from-indigo-500 via-violet-500 to-purple-600 text-white relative overflow-hidden shadow-lg shadow-indigo-200"
        >
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 right-10 w-16 h-16 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <div className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-widest">
              AI Powered
            </div>
            <div className="text-xl font-black tracking-tight mb-0.5">
              Smart Prep
            </div>
            <div className="text-[11px] opacity-60 mb-3">
              Tailored to your role & experience
            </div>
            <div className="text-[10px] font-semibold bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 inline-block backdrop-blur-sm">
              ✦ AI Curated Topics
            </div>
          </div>
        </motion.div>
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
              Preparation Sessions
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Track and manage your interview prep plans
            </p>
          </div>
          <div className="flex gap-2">
            {[
              {
                label: "Total",
                value: sessions.length,
                grad: "from-indigo-500 to-violet-600",
                shadow: "shadow-indigo-200",
              },
              {
                label: "This Month",
                value: thisMonth,
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
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <svg
                className="w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
              </svg>
              <span className="text-sm font-semibold text-slate-800">
                Your Sessions
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={sessions.length}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-slate-400"
              >
                {sessions.length} session{sessions.length !== 1 ? "s" : ""}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">
              {/* Skeleton */}
              {loading && (
                <motion.div
                  key="skeleton"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <SessionCardSkeleton key={i} />
                  ))}
                </motion.div>
              )}

              {/* Empty */}
              {!loading && sessions.length === 0 && (
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
                    📚
                  </motion.div>
                  <div className="text-base font-semibold text-slate-700">
                    No prep sessions yet
                  </div>
                  <div className="text-sm text-slate-400 mt-1 mb-6">
                    Create your first preparation session to get started
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

              {/* Grid */}
              {!loading && sessions.length > 0 && (
                <motion.div
                  key="grid"
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.07 } } }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
                >
                  <AnimatePresence>
                    {sessions.map((session, idx) => {
                      const p = CARD_PALETTES[idx % CARD_PALETTES.length];
                      const initials =
                        session.role?.slice(0, 2).toUpperCase() || "PR";
                      const topics = session.topicsToFocus ?? [];

                      return (
                        <motion.div
                          key={session.id}
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
                                  {session.role}
                                </div>
                                <div className="text-[10px] text-slate-300 font-medium mt-0.5">
                                  {session.createdAt?.slice(0, 10)}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 shrink-0 ${p.pill}`}
                            >
                              {session.experience} yr
                              {session.experience !== 1 ? "s" : ""}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.08, rotate: 6 }}
                              whileTap={{ scale: 0.94 }}
                              disabled={deletingId === session.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(session.id);
                              }}
                              className="w-8 h-8 rounded-xl border border-red-100 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50"
                            >
                              {deletingId === session.id ? (
                                <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4h8v2" />
                                  <path d="M19 6l-1 14H6L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                </svg>
                              )}
                            </motion.button>
                          </div>

                          {/* Description */}
                          <div className="relative">
                            <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 group-hover:text-slate-700 transition-colors duration-200">
                              {session.description}
                            </p>
                          </div>

                          {/* Topics chips */}
                          {topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 relative">
                              {topics.slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${p.pill}`}
                                >
                                  {t}
                                </span>
                              ))}
                              {topics.length > 3 && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-400 border border-slate-200/60">
                                  +{topics.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* View button */}
                          <motion.button
                            whileHover={{
                              scale: 1.03,
                              y: -1,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                            }}
                            whileTap={{ scale: 0.97 }}
                            className={`relative w-full py-2.5 rounded-xl bg-linear-to-br ${p.grad} text-white text-xs font-bold shadow-md ${p.shadow} transition-all duration-200 cursor-pointer`}
                            onClick={() => navigate(`${session.id}`)}
                          >
                            View Session →
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
          <CreateSessionModal
            onClose={() => setShowModal(false)}
            onCreate={(session) => setSessions((prev) => [session, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Preparations;
