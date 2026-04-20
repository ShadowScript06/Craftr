import { getToken } from "@clerk/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Transition, type Variants } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Session {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
  experience: number;
  questions: Question[];
  topics: Topic[];
}

interface Question {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  explaination: string;
  sessionId: string;
}

interface Topic {
  id: string;
  name: string;
  sessionId: string;
}

interface ExplainJSON {
  mainExplanation: string;
  codeExample?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
const shimmerTransition: Transition = { duration: 1.4, repeat: Infinity, ease: "easeInOut" };
const shimmer = { animate: { opacity: [0.4, 0.9, 0.4] }, transition: shimmerTransition };

function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl p-7 space-y-4">
        <div className="flex items-center gap-3">
          <motion.div {...shimmer} className="w-12 h-12 rounded-2xl bg-slate-200" />
          <div className="space-y-2">
            <motion.div {...shimmer} className="h-4 w-36 bg-slate-200 rounded-full" />
            <motion.div {...shimmer} className="h-3 w-24 bg-slate-100 rounded-full" />
          </div>
        </div>
        <motion.div {...shimmer} className="h-7 w-48 bg-slate-200 rounded-xl" />
        <div className="flex gap-2">
          {[80, 64, 96, 72].map((w, i) => (
            <motion.div key={i} {...shimmer} className="h-5 bg-slate-100 rounded-full" style={{ width: w }} />
          ))}
        </div>
      </div>
      {/* Question skeletons */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-md p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <motion.div {...shimmer} className="w-7 h-7 rounded-lg bg-slate-200 shrink-0" />
              <motion.div {...shimmer} className="h-4 flex-1 bg-slate-200 rounded-full" />
            </div>
            <div className="flex gap-2 ml-4 shrink-0">
              <motion.div {...shimmer} className="h-7 w-20 bg-slate-200 rounded-xl" />
              <motion.div {...shimmer} className="h-7 w-20 bg-slate-200 rounded-xl" />
            </div>
          </div>
          <motion.div {...shimmer} className="h-3 w-28 bg-slate-100 rounded-full ml-10" />
        </div>
      ))}
    </div>
  );
}

// ── Card palettes ─────────────────────────────────────────────────────────────
const PALETTES = [
  { grad: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-200", pill: "bg-indigo-50 text-indigo-600 ring-indigo-100", dot: "bg-indigo-400" },
  { grad: "from-emerald-400 to-teal-500",  shadow: "shadow-emerald-200", pill: "bg-emerald-50 text-emerald-600 ring-emerald-100", dot: "bg-emerald-400" },
  { grad: "from-amber-400 to-orange-500",  shadow: "shadow-amber-200",   pill: "bg-amber-50 text-amber-600 ring-amber-100",   dot: "bg-amber-400" },
  { grad: "from-rose-400 to-pink-500",     shadow: "shadow-rose-200",    pill: "bg-rose-50 text-rose-600 ring-rose-100",     dot: "bg-rose-400" },
  { grad: "from-sky-400 to-blue-500",      shadow: "shadow-sky-200",     pill: "bg-sky-50 text-sky-600 ring-sky-100",        dot: "bg-sky-400" },
  { grad: "from-violet-500 to-purple-600", shadow: "shadow-violet-200",  pill: "bg-violet-50 text-violet-600 ring-violet-100", dot: "bg-violet-400" },
];

// ── Framer variants ───────────────────────────────────────────────────────────
const expandVar: Variants = {
  hidden: { opacity: 0, height: 0 },
  show:   { opacity: 1, height: "auto", transition: { duration: 0.3, ease: "easeOut" } },
  exit:   { opacity: 0, height: 0,      transition: { duration: 0.2 } },
};

const slideVar: Variants = {
  hidden: { opacity: 0, x: 24 },
  show:   { opacity: 1, x: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
  exit:   { opacity: 0, x: 24, transition: { duration: 0.18 } },
};

const toastVar: Variants = {
  hidden: { opacity: 0, y: -40 },
  show:   { opacity: 1, y: 0,   transition: { type: "spring", stiffness: 320, damping: 26 } },
  exit:   { opacity: 0, y: -40 },
};

// ── Code block ────────────────────────────────────────────────────────────────
function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-700/60 shadow-lg my-2">
      {/* Editor top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-widest ml-1">
            {language || "code"}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={copy}
          className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </motion.button>
      </div>
      {/* Code body */}
      <pre className="bg-slate-900 px-5 py-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Explanation panel ─────────────────────────────────────────────────────────
function ExplanationPanel({ raw }: { raw: string }) {
  let parsed: ExplainJSON | null = null;

  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    // not valid JSON
  }

  if (!parsed) {
    return <p className="text-sm text-slate-600 leading-relaxed">{raw}</p>;
  }

  return (
    <div className="space-y-5">
      {/* Main explanation */}
      {parsed.mainExplanation && (
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Explanation</div>
          <p className="text-sm text-slate-700 leading-relaxed">{parsed.mainExplanation}</p>
        </div>
      )}

      {/* Code example */}
      {parsed.codeExample && (
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Code Example</div>
          <CodeBlock code={parsed.codeExample} language="javascript" />
        </div>
      )}

      {/* Complexity badges */}
      {(parsed.timeComplexity || parsed.spaceComplexity) && (
        <div className="grid grid-cols-2 gap-3">
          {parsed.timeComplexity && (
            <div className="bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100">
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Time Complexity</div>
              <div className="text-sm font-black text-indigo-600 font-mono">{parsed.timeComplexity}</div>
            </div>
          )}
          {parsed.spaceComplexity && (
            <div className="bg-emerald-50 rounded-xl px-4 py-3 border border-emerald-100">
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Space Complexity</div>
              <div className="text-sm font-black text-emerald-600 font-mono">{parsed.spaceComplexity}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Question Card ─────────────────────────────────────────────────────────────
function QuestionCard({
  q, index, activeExplain, setActiveExplain,
}: {
  q: Question;
  index: number;
  activeExplain: string | null;
  setActiveExplain: (id: string | null) => void;
}) {
  const [showAnswer, setShowAnswer] = useState(false);
  const p           = PALETTES[index % PALETTES.length];
  const isExplaining = activeExplain === q.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 24, delay: index * 0.04 }}
      className={`bg-white/90 backdrop-blur-lg rounded-2xl border shadow-md overflow-hidden transition-all duration-300 ${
        isExplaining ? "border-amber-200/80 ring-2 ring-amber-200/40" : "border-slate-200/60"
      }`}
    >
      <div className="p-5">
        <div className="flex items-start gap-3">
          {/* Number badge */}
          <div className={`w-7 h-7 rounded-lg bg-linear-to-br ${p.grad} flex items-center justify-center text-[10px] font-black text-white shadow-md ${p.shadow} shrink-0 mt-0.5`}>
            {index + 1}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.question}</p>
            <span className="text-[10px] text-slate-300 font-medium mt-1 block">{q.createdAt?.slice(0, 10)}</span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 shrink-0 ml-2">
            <motion.button
              whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.96 }}
              onClick={() => setShowAnswer(!showAnswer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-200 cursor-pointer ${
                showAnswer
                  ? `bg-linear-to-br ${p.grad} text-white border-transparent shadow-md ${p.shadow}`
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
              }`}
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${showAnswer ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
              Answer
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.06, y: -1 }} whileTap={{ scale: 0.96 }}
              onClick={() => setActiveExplain(isExplaining ? null : q.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all duration-200 cursor-pointer ${
                isExplaining
                  ? "bg-linear-to-br from-amber-400 to-orange-500 text-white border-transparent shadow-md shadow-amber-200"
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:border-amber-300 hover:text-amber-500"
              }`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
              Explain
            </motion.button>
          </div>
        </div>

        {/* Answer dropdown */}
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              variants={expandVar} initial="hidden" animate="show" exit="exit"
              className="overflow-hidden"
            >
              <div className="mt-4 ml-10 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Answer</span>
                </div>
                <p className={`text-sm leading-relaxed font-semibold bg-linear-to-r ${p.grad} bg-clip-text text-transparent`}>
                  {q.answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function PreparationSession() {
  const { id }                            = useParams();
  const navigate                          = useNavigate();
  const [loading, setLoading]             = useState<boolean>(false);
  const [loadingMore, setLoadingMore]     = useState<boolean>(false);
  const [session, setSession]             = useState<Session | null>(null);
  const [activeExplain, setActiveExplain] = useState<string | null>(null);
  const [toast, setToast]                 = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  async function fetchSession() {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/preparations/sessions/${id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSession(res.data.data);
    } catch (error) {
      console.log(error);
      showToast("Failed to load session.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadMore() {
    try {
      setLoadingMore(true);
      const token = await getToken();
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/preparations/sessions/${id}/questions`,{},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const newSession: Session = res.data.data;
      setSession(newSession)
    } catch (error) {
      console.log(error);
      showToast("Failed to load more questions.");
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => { fetchSession(); }, []);

  const explainQuestion = session?.questions.find((q) => q.id === activeExplain) ?? null;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 font-sans">

      {/* ── Navbar ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/60"
      >
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight leading-none">Craftr</div>
            <div className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase">Preparations</div>
          </div>
        </div>
        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
          AI
        </div>
      </motion.div>

      <div className="px-6 py-8 max-w-7xl mx-auto">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ x: -3 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors mb-6"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M19 12H5m7-7-7 7 7 7" />
          </svg>
          Back to Preparations
        </motion.button>

        {/* ── Loading ── */}
        {loading && <PageSkeleton />}

        {/* ── Not found ── */}
        {!loading && !session && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="text-5xl mb-4">
              🔍
            </motion.div>
            <div className="text-base font-semibold text-slate-700">Session not found</div>
            <div className="text-sm text-slate-400 mt-1 mb-6">This session may have been removed.</div>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 cursor-pointer"
            >
              ← Go Back
            </motion.button>
          </motion.div>
        )}

        {/* ── Content ── */}
        {!loading && session && (
          <div className="space-y-6">

            {/* Header card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7"
            >
              <div className="flex items-center gap-3 mb-4">
                <motion.div
                  whileHover={{ scale: 1.08, rotate: 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                  className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-black text-white shadow-lg shadow-indigo-200"
                >
                  {session.role?.slice(0, 2).toUpperCase()}
                </motion.div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Preparation Session</div>
                  <div className="text-[10px] text-slate-300 font-medium">{session.createdAt?.slice(0, 10)}</div>
                </div>
              </div>

              <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">{session.role}</h1>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-500 ring-1 ring-indigo-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                  {session.experience} yr{session.experience !== 1 ? "s" : ""} exp
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                  {session.questions?.length ?? 0} questions
                </span>
                {session.topics?.map((t) => (
                  <span key={t.id} className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200/60">
                    {t.name}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Two-column layout */}
            <div className={`grid gap-6 transition-all duration-500 ${explainQuestion ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1 mb-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">Questions</span>
                  <span className="ml-auto text-xs text-slate-400">{session.questions?.length ?? 0} total</span>
                </div>

                <AnimatePresence>
                  {(session.questions ?? []).map((q, i) => (
                    <QuestionCard
                      key={q.id}
                      q={q}
                      index={i}
                      activeExplain={activeExplain}
                      setActiveExplain={setActiveExplain}
                    />
                  ))}
                </AnimatePresence>

                {/* Load more */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -1, boxShadow: "0 10px 28px rgba(99,102,241,0.25)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="w-full py-3 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loadingMore ? (
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div key={i}
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                          className="w-1.5 h-1.5 rounded-full bg-white/80"
                        />
                      ))}
                    </div>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      Load More Questions
                    </>
                  )}
                </motion.button>
              </div>

              {/* Explanation panel */}
              <AnimatePresence>
                {explainQuestion && (
                  <motion.div
                    key={explainQuestion.id}
                    variants={slideVar} initial="hidden" animate="show" exit="exit"
                    className="bg-white/80 backdrop-blur-lg rounded-3xl border border-amber-200/60 shadow-xl shadow-amber-100/30 overflow-hidden self-start sticky top-24"
                  >
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100/60 bg-linear-to-r from-amber-50/80 to-orange-50/40">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-slate-800">Explanation</span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveExplain(null)}
                        className="w-7 h-7 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                      </motion.button>
                    </div>

                    {/* Question recap */}
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Question</div>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed">{explainQuestion.question}</p>
                    </div>

                    {/* Explanation body */}
                    <div className="px-6 py-5 max-h-[62vh] overflow-y-auto">
                      <ExplanationPanel raw={explainQuestion.explaination} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            variants={toastVar} initial="hidden" animate="show" exit="exit"
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-red-500 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl shadow-red-200"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PreparationSession;