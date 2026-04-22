import { getToken } from "@clerk/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Transition, type Variants } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Feedback {
  id: string;
  resumeId: string;
  overallScore: number;
  atsScore: number;
  content: { score: number; feedback: string };
  skills: { score: number; missing: string[]; feedback: string };
  structure: { score: number; feedback: string };
  tone: { score: number; feedback: string };
  summary: string;
  suggestions: string[];
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  jobTitle: string | null;
  jobDescription: string;
  companyName: string | null;
  extractedText: string;
  resumeUrl: string;
  previewImageUrl: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | string;
  feedback: Feedback;
  createdAt: string;
  updatedAt: string;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const shimmerTransition: Transition = { duration: 1.4, repeat: Infinity, ease: "easeInOut" };
const shimmer = { animate: { opacity: [0.4, 0.9, 0.4] }, transition: shimmerTransition };

function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl p-7 space-y-4">
        <div className="flex items-center gap-3">
          <motion.div {...shimmer} className="w-14 h-14 rounded-2xl bg-slate-200" />
          <div className="space-y-2 flex-1">
            <motion.div {...shimmer} className="h-5 w-48 bg-slate-200 rounded-full" />
            <motion.div {...shimmer} className="h-3 w-32 bg-slate-100 rounded-full" />
          </div>
          <motion.div {...shimmer} className="h-8 w-24 bg-slate-200 rounded-full" />
        </div>
      </div>
      {/* Score cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-md p-5 space-y-3">
            <motion.div {...shimmer} className="h-3 w-16 bg-slate-200 rounded-full" />
            <motion.div {...shimmer} className="h-10 w-20 bg-slate-200 rounded-xl" />
            <motion.div {...shimmer} className="h-2 w-full bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
      {/* Content blocks */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl p-7 space-y-3">
          <motion.div {...shimmer} className="h-4 w-32 bg-slate-200 rounded-full" />
          <motion.div {...shimmer} className="h-3 w-full bg-slate-100 rounded-full" />
          <motion.div {...shimmer} className="h-3 w-5/6 bg-slate-100 rounded-full" />
          <motion.div {...shimmer} className="h-3 w-4/6 bg-slate-100 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, label,  size = 80 }: {
  score: number; label: string; grad: string; size?: number;
}) {
  const r          = (size / 2) - 8;
  const circ       = 2 * Math.PI * r;
  const pct        = Math.min(Math.max(score, 0), 100);
  const dashOffset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" strokeWidth="6" strokeLinecap="round"
            stroke="url(#grad)"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black text-slate-800">{pct}</span>
        </div>
      </div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

// ── Score bar card ────────────────────────────────────────────────────────────
function ScoreCard({ label, score, feedback, grad,  pill }: {
  label: string; score: number; feedback: string;
  grad: string; shadow: string; pill: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-md p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        <span className={`text-xs font-black px-2 py-0.5 rounded-full ring-1 ${pill}`}>{score}/100</span>
      </div>
      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className={`h-full rounded-full bg-gradient-to-r ${grad}`}
        />
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{feedback}</p>
    </motion.div>
  );
}

// ── Framer variants ───────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResumeFeedbackPage() {
  const { id }                    = useParams();
  const navigate                  = useNavigate();
  const [resume, setResume]       = useState<Resume | null>(null);
  const [loading, setLoading]     = useState(true);

  const API = `${import.meta.env.VITE_BACKEND_URL}/analyse`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const res = await axios.get(`${API}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResume(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const feedback = resume?.feedback ?? null;

  const SCORE_CARDS = feedback ? [
    { label: "Content",   score: feedback.content.score,   feedback: feedback.content.feedback,   grad: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-200", pill: "bg-indigo-50 text-indigo-600 ring-indigo-100" },
    { label: "Skills",    score: feedback.skills.score,    feedback: feedback.skills.feedback,    grad: "from-emerald-400 to-teal-500",  shadow: "shadow-emerald-200", pill: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
    { label: "Structure", score: feedback.structure.score, feedback: feedback.structure.feedback, grad: "from-amber-400 to-orange-500",  shadow: "shadow-amber-200",  pill: "bg-amber-50 text-amber-600 ring-amber-100" },
    { label: "Tone",      score: feedback.tone.score,      feedback: feedback.tone.feedback,      grad: "from-rose-400 to-pink-500",     shadow: "shadow-rose-200",   pill: "bg-rose-50 text-rose-600 ring-rose-100" },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 font-sans">

      {/* ── Navbar ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/60"
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight leading-none">Craftr</div>
            <div className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase">Resume Analyser</div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">AI</div>
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ x: -3 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M19 12H5m7-7-7 7 7 7" />
          </svg>
          Back to Resumes
        </motion.button>

        {/* ── Loading ── */}
        {loading && <PageSkeleton />}

        {/* ── Not found ── */}
        {!loading && !resume && (
          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center">
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="text-5xl mb-4">📄</motion.div>
            <div className="text-base font-semibold text-slate-700">Resume not found</div>
            <div className="text-sm text-slate-400 mt-1 mb-6">This resume may have been removed.</div>
            <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 cursor-pointer">
              ← Go Back
            </motion.button>
          </motion.div>
        )}

        {/* ── Content ── */}
        {!loading && resume && (
          <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }} className="space-y-6">

            {/* ── Header card ── */}
            <motion.div variants={fadeUp}
              className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7"
            >
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-base font-black text-white shadow-lg shadow-indigo-200 shrink-0"
                >
                  {(resume.companyName ?? resume.jobTitle ?? "RS").slice(0, 2).toUpperCase()}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight truncate">
                    {resume.jobTitle ?? "Untitled Position"}
                  </h1>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-xs text-slate-400 font-medium">{resume.companyName ?? "No Company"}</span>
                    <span className="text-slate-200">·</span>
                    <span className="text-xs text-slate-400 font-medium">{resume.createdAt?.slice(0, 10)}</span>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ring-1 shrink-0 ${
                  resume.status === "COMPLETED"   ? "bg-emerald-50 text-emerald-600 ring-emerald-100" :
                  resume.status === "IN_PROGRESS" ? "bg-amber-50 text-amber-600 ring-amber-100" :
                  "bg-slate-100 text-slate-500 ring-slate-200"
                }`}>
                  <motion.span
                    animate={resume.status === "IN_PROGRESS" ? { opacity: [1, 0.3, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`w-1.5 h-1.5 rounded-full ${
                      resume.status === "COMPLETED" ? "bg-emerald-400" :
                      resume.status === "IN_PROGRESS" ? "bg-amber-400" : "bg-slate-400"
                    }`}
                  />
                  {resume.status}
                </span>
              </div>

              {/* View resume link */}
              {resume.resumeUrl && (
                <a href={resume.resumeUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" />
                  </svg>
                  View Original Resume
                </a>
              )}
            </motion.div>

            {/* ── No feedback yet ── */}
            {!feedback && (
              <motion.div variants={fadeUp}
                className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl p-12 flex flex-col items-center text-center">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="text-5xl mb-4">⏳</motion.div>
                <div className="text-base font-semibold text-slate-700">No feedback yet</div>
                <div className="text-sm text-slate-400 mt-1">Run the analysis first to see your feedback here.</div>
              </motion.div>
            )}

            {feedback && (
              <>
                {/* ── Overall scores ── */}
                <motion.div variants={fadeUp}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7"
                >
                  <div className="flex items-center gap-2.5 mb-6">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">Overall Scores</span>
                  </div>

                  <div className="flex items-center justify-around">
                    <ScoreRing score={feedback.overallScore} label="Overall" grad="from-indigo-500 to-violet-600" size={100} />
                    <div className="w-px h-16 bg-slate-100" />
                    <ScoreRing score={feedback.atsScore} label="ATS Score" grad="from-emerald-400 to-teal-500" size={100} />
                  </div>
                </motion.div>

                {/* ── Detailed score cards ── */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SCORE_CARDS.map((card) => <ScoreCard key={card.label} {...card} />)}
                </motion.div>

                {/* ── Summary ── */}
                <motion.div variants={fadeUp}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-md shadow-sky-200">
                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                      </svg>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">Summary</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{feedback.summary}</p>
                </motion.div>

                {/* ── Missing skills ── */}
                {feedback.skills.missing?.length > 0 && (
                  <motion.div variants={fadeUp}
                    className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7"
                  >
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md shadow-rose-200">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">Missing Skills</span>
                      <span className="ml-auto text-xs font-bold text-rose-500">{feedback.skills.missing.length} skills</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {feedback.skills.missing.map((skill, i) => (
                        <motion.span
                          key={skill}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.04 }}
                          whileHover={{ scale: 1.05, y: -1 }}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 ring-1 ring-rose-100 cursor-default"
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ── Suggestions ── */}
                {feedback.suggestions?.length > 0 && (
                  <motion.div variants={fadeUp}
                    className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7"
                  >
                    <div className="flex items-center gap-2.5 mb-5">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-slate-800">Suggestions</span>
                      <span className="ml-auto text-xs font-bold text-amber-500">{feedback.suggestions.length} tips</span>
                    </div>

                    <div className="space-y-3">
                      {feedback.suggestions.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06, type: "spring", stiffness: 260, damping: 24 }}
                          className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/50 border border-amber-100/60"
                        >
                          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-black text-white shadow-sm shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{s}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}