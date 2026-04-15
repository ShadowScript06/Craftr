import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "axios";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";


const fadeUp :Variants= {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 24, delay: i * 0.1 },
  }),
};

const CARDS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
      </svg>
    ),
    iconBg: "from-indigo-500 to-violet-600",
    iconShadow: "shadow-indigo-200",
    tag: "Productivity",
    tagColor: "bg-indigo-50 text-indigo-500 ring-indigo-100",
    title: "Track Applications",
    description:
      "Keep every job application organised in one place. Monitor status, add notes, and never lose track of your pipeline.",
    cta: "Open Tracker",
    ctaStyle: "from-indigo-500 to-violet-600 shadow-indigo-200",
    route: "/applicationTracker",
    disabled: false,
    accentDot: "bg-indigo-400",
    blob: "from-indigo-100/60 to-violet-100/40",
  },
 {
  icon: (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 2a4 4 0 0 0-4 4v1H6a2 2 0 0 0-2 2v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V9a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
      <path d="M8 12h8M8 16h6" />
    </svg>
  ),

  iconBg: "from-blue-400 to-sky-500",
  iconShadow: "shadow-blue-200",

  tag: "AI Assessment",
  tagColor: "bg-blue-50 text-blue-600 ring-blue-100",

  title: "Mock Tests",
  description:
    "Simulate real interview questions  with AI, Answer them. Get structured evaluation, feedback, and performance scoring.",

  cta: "Start Test",
  ctaStyle: "from-blue-500 to-sky-500 shadow-blue-200",

  route: "/tests",
  disabled: false,

  accentDot: "bg-blue-400",
  blob: "from-blue-100/60 to-sky-100/40",
},
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    iconBg: "from-emerald-400 to-teal-500",
    iconShadow: "shadow-emerald-200",
    tag: "Discovery",
    tagColor: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    title: "Find Jobs",
    description:
      "Browse thousands of curated listings tailored to your skills. Search, filter, and land your next opportunity.",
    cta: "Explore Jobs",
    ctaStyle: "from-emerald-400 to-teal-500 shadow-emerald-200",
    route: "/jobs",
    disabled: false,
    accentDot: "bg-emerald-400",
    blob: "from-emerald-100/60 to-teal-100/40",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    iconBg: "from-amber-400 to-orange-500",
    iconShadow: "shadow-amber-200",
    tag: "Coming Soon",
    tagColor: "bg-amber-50 text-amber-500 ring-amber-100",
    title: "AI Resume Match",
    description:
      "Let AI analyse your resume against job descriptions and suggest improvements to boost your match score.",
    cta: "Coming Soon",
    ctaStyle: "from-slate-200 to-slate-300 shadow-slate-100",
    route: null,
    disabled: true,
    accentDot: "bg-amber-400",
    blob: "from-amber-100/60 to-orange-100/40",
  },
];

function DashBoard() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function syncUser() {
      const token = await getToken();
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/sync-user`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.status !== 200) {
        alert("Error login, Please try again");
        navigate("/login");
      }
    }
    syncUser();
  }, [getToken, navigate]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 font-sans">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-12">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="text-center space-y-3"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22, delay: 0.05 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[11px] font-bold text-indigo-500 uppercase tracking-widest mb-2"
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            />
            Welcome to Craftr
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Your Job Search,{" "}
            <span className="bg-linear-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
              Supercharged
            </span>
          </h1>

          <p className="text-sm text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
            Everything you need to manage your career journey — from finding
            opportunities to landing offers.
          </p>
        </motion.div>

        {/* Stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 26 }}
          className="grid grid-cols-3 gap-4"
        >
          {[
            { label: "Jobs Listed", value: "10k+", color: "text-indigo-600" },
            { label: "Applications Tracked", value: "∞", color: "text-emerald-500" },
            { label: "Match Accuracy", value: "84%", color: "text-amber-500" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-md shadow-slate-200/30 px-5 py-4 text-center"
            >
              <div className={`text-2xl font-black tracking-tight ${color}`}>{value}</div>
              <div className="text-[11px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              whileHover={!card.disabled ? { y: -4, boxShadow: "0 20px 48px rgba(99,102,241,0.10)" } : {}}
              className="relative bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-6 flex flex-col gap-5 overflow-hidden"
            >
              {/* Blob accent */}
              <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full bg-linear-to-br ${card.blob} blur-2xl`} />

              {/* Icon + tag */}
              <div className="relative flex items-start justify-between">
                <div className={`w-11 h-11 rounded-2xl bg-linear-to-br ${card.iconBg} flex items-center justify-center text-white shadow-lg ${card.iconShadow}`}>
                  {card.icon}
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ${card.tagColor}`}>
                  {card.tag}
                </span>
              </div>

              {/* Text */}
              <div className="relative flex-1 space-y-2">
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  {card.title}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={!card.disabled ? { scale: 1.03, y: -1, boxShadow: "0 10px 28px rgba(99,102,241,0.25)" } : {}}
                whileTap={!card.disabled ? { scale: 0.97 } : {}}
                disabled={card.disabled}
                onClick={() => card.route && navigate(card.route)}
                className={`relative w-full py-2.5 rounded-xl bg-linear-to-br ${card.ctaStyle} text-white text-xs font-bold shadow-md transition-all duration-200 ${card.disabled ? "opacity-60 cursor-not-allowed text-slate-500" : "cursor-pointer"}`}
              >
                {card.cta}
              </motion.button>

              {/* Bottom accent line */}
              <div className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-linear-to-r ${card.iconBg} opacity-20`} />
            </motion.div>
          ))}
        </div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 justify-center"
        >
          <div className="h-px flex-1 bg-slate-200/60 max-w-24" />
          <span className="text-[11px] text-slate-300 font-semibold tracking-widest uppercase">
            More features coming soon
          </span>
          <div className="h-px flex-1 bg-slate-200/60 max-w-24" />
        </motion.div>

      </div>
    </div>
  );
}

export default DashBoard;