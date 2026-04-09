import { motion } from "framer-motion";
import type { Application,LogoPalette,StatusConfig } from "../../types/applicationTracker";
import { useNavigate } from "react-router-dom";
import type { Variants } from "framer-motion";
export default function  AppRow({ app, index }: { app: Application; index: number }) {
  const rowVar: Variants = {
  hidden: { opacity: 0, x: -16 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
  exit: { opacity: 0, x: 16, transition: { duration: 0.18 } },
};
const STATUS: Record<string, StatusConfig> = {
  applied: {
    label: "Applied",
    pill: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
  },
  shortlisted: {
    label: "Shortlisted",
    pill: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
  },
  offer: {
    label: "Offer",
    pill: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  },
  rejected: {
    label: "Rejected",
    pill: "bg-red-50 text-red-400 ring-1 ring-red-100",
  },
  interview: {
    label: "Interview",
    pill: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
  },
};

const LOGO_PALETTES: LogoPalette[] = [
  { bg: "#eef2ff", color: "#4f46e5" },
  { bg: "#fef3c7", color: "#d97706" },
  { bg: "#ecfdf5", color: "#059669" },
  { bg: "#fce7f3", color: "#9d174d" },
  { bg: "#eff6ff", color: "#2563eb" },
  { bg: "#f5f3ff", color: "#7c3aed" },
  { bg: "#fff7ed", color: "#c2410c" },
  { bg: "#f0fdf4", color: "#166534" },
];


  const palette = LOGO_PALETTES[index % LOGO_PALETTES.length];
  const initials = app.company
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const status = STATUS[app.status.toLowerCase()] || STATUS.applied;
  const isRemote = app.location === "remote";
  const navigate=useNavigate();
  return (
    <motion.div
      layout
      variants={rowVar}
      initial="hidden"
      animate="show"
      exit="exit"
      whileHover={{ backgroundColor: "rgba(99,102,241,0.025)", x: 2 }}
      className="grid items-center gap-4 px-6 py-3.5 border-b border-slate-100 cursor-pointer group transition-colors"
      style={{ gridTemplateColumns: "40px 1fr 130px 90px 70px" }}
      onClick={()=>navigate(`/applicationtracker/${app.id}`)}
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 3 }}
        transition={{ type: "spring", stiffness: 400 }}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border border-black/5"
        style={{ background: palette.bg, color: palette.color }}
      >
        {initials}
      </motion.div>

      <div>
        <div className="text-sm font-semibold text-slate-800 tracking-tight leading-tight">
          {app.role}
        </div>
        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
          {app.company}
          {isRemote ? (
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md">
              Remote
            </span>
          ) : (
            <span>· {app.location}</span>
          )}
        </div>
      </div>

      <div>
        <motion.span
          layout
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${status.pill}`}
        >
          {status.label}
        </motion.span>
      </div>

      <div className="text-xs text-slate-400">{app.appliedAt.slice(0, 10)}</div>
      <div className="text-xs font-semibold text-slate-600">{app.salary}</div>
    </motion.div>
  );
}