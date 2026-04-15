import { getToken } from "@clerk/react";
import axios from "axios";
import {
  motion,
  AnimatePresence,
  type Variants,
  type Transition,
} from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Question {
  id: string;
  sessionId: string;
  type: string;
  question: string;
  answer: string;
  userAnswer: string;
  isCorrect: boolean;
  order: number;
  createdAt: string;
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

function SessionSkeleton() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Progress bar skeleton */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-md p-4 flex items-center gap-4">
        <motion.div
          {...shimmer}
          className="h-3 w-24 bg-slate-200 rounded-full"
        />
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            {...shimmer}
            className="h-full w-1/3 bg-slate-200 rounded-full"
          />
        </div>
        <motion.div
          {...shimmer}
          className="h-3 w-16 bg-slate-100 rounded-full"
        />
      </div>

      {/* Question card skeleton */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl p-8 space-y-5">
        <motion.div
          {...shimmer}
          className="h-3 w-20 bg-slate-200 rounded-full"
        />
        <motion.div
          {...shimmer}
          className="h-6 w-full bg-slate-200 rounded-xl"
        />
        <motion.div
          {...shimmer}
          className="h-4 w-3/4 bg-slate-100 rounded-xl"
        />
        <motion.div
          {...shimmer}
          className="h-32 w-full bg-slate-100 rounded-2xl mt-4"
        />
        <div className="flex gap-3 pt-2">
          <motion.div
            {...shimmer}
            className="h-10 w-24 bg-slate-200 rounded-xl"
          />
          <motion.div
            {...shimmer}
            className="h-10 flex-1 bg-slate-200 rounded-xl"
          />
          <motion.div
            {...shimmer}
            className="h-10 w-24 bg-slate-200 rounded-xl"
          />
        </div>
      </div>
    </div>
  );
}

// ── Loading overlay ───────────────────────────────────────────────────────────
function LoadingOverlay({ text }: { text: string }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-center justify-center font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex gap-2">
          {["bg-indigo-400", "bg-violet-400", "bg-emerald-400"].map((c, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], y: [0, -6, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
              className={`w-3 h-3 rounded-full ${c}`}
            />
          ))}
        </div>
        <p className="text-sm font-semibold text-slate-400">{text}</p>
      </motion.div>
    </div>
  );
}

// ── Question type pill colours ────────────────────────────────────────────────
const TYPE_COLORS: Record<string, string> = {
  mcq: "bg-indigo-50 text-indigo-500 ring-indigo-100",
  coding: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  theory: "bg-amber-50 text-amber-500 ring-amber-100",
  behavioural: "bg-violet-50 text-violet-500 ring-violet-100",
  default: "bg-slate-100 text-slate-500 ring-slate-200",
};

function typePill(type: string) {
  return TYPE_COLORS[type?.toLowerCase()] ?? TYPE_COLORS.default;
}

// ── Framer variants ───────────────────────────────────────────────────────────
const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.18 },
  }),
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

// ── Question Carousel ─────────────────────────────────────────────────────────
function QuestionCarousel({
  data,
  sessionId,
  interviewId,
  onEnd,
}: {
  data: Question[];
  sessionId: string;
  interviewId: string;
  onEnd: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>(
    data.map((q) => ({ ...q })),
  );
  const [submittingAnswer, setSubmittingAnswer] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());

  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const progress = total > 0 ? (currentIndex / total) * 100 : 0;
  const navigate=useNavigate();
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const updated = [...questions];
    updated[currentIndex].userAnswer = e.target.value;
    setQuestions(updated);
  };

  const handleSubmit = async (questionId: string) => {
  if (!currentQuestion.userAnswer?.trim()) {
    showToast("Please write an answer before submitting.");
    return;
  }

  try {
    setSubmittingAnswer(true);

    const token = await getToken();

    // 1. Submit answer
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/interviews/${interviewId}/sessions/${sessionId}/questions/${questionId}/answer`,
      { answer: currentQuestion.userAnswer },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 2. If last question → end session
    if (currentIndex === questions.length - 1) {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/interviews/${interviewId}/sessions/${sessionId}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(-1);
      return;
    }

    // 3. Otherwise move to next question
    setDirection(1);
    setCurrentIndex((prev) => prev + 1);

  } catch (error) {
    console.log(error);
    showToast("Failed to submit answer. Please try again.");
  } finally {
    setSubmittingAnswer(false);
  }
};

  const handleNext = () => {
    let idx = currentIndex + 1;

    while (idx < questions.length && submittedIds.has(questions[idx].id)) {
      idx++;
    }

    if (idx < questions.length) {
      setDirection(1);
      setCurrentIndex(idx);
    }
  };

  const handlePrev = () => {
    let idx = currentIndex - 1;

    while (idx >= 0 && submittedIds.has(questions[idx].id)) {
      idx--;
    }

    if (idx >= 0) {
      setDirection(-1);
      setCurrentIndex(idx);
    }
  };

  if (submittingAnswer) return <LoadingOverlay text="Submitting Answer…" />;

  if (questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-5xl mb-4"
        >
          🎉
        </motion.div>
        <div className="text-lg font-black text-slate-800 mb-1">
          All questions answered!
        </div>
        <div className="text-sm text-slate-400 mb-6">
          You've completed all questions in this session.
        </div>
        <motion.button
          whileHover={{
            scale: 1.04,
            y: -1,
            boxShadow: "0 10px 28px rgba(99,102,241,0.3)",
          }}
          whileTap={{ scale: 0.97 }}
          onClick={onEnd}
          className="px-6 py-2.5 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 cursor-pointer"
        >
          End Session →
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-md px-5 py-3 flex items-center gap-4"
      >
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
          Question {currentIndex + 1} / {total}
        </span>
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-600"
          />
        </div>
        <span className="text-[11px] font-bold text-indigo-500 whitespace-nowrap">
          {Math.round(progress)}% done
        </span>
      </motion.div>

      {/* Question card */}
      <div className="relative overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-8 relative overflow-hidden"
          >
            {/* Blob accent */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-linear-to-br from-indigo-200/30 to-violet-200/20 blur-2xl pointer-events-none" />

            {/* Type pill + order */}
            <div className="relative flex items-center justify-between mb-5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ring-1 ${typePill(currentQuestion.type)}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                {currentQuestion.type}
              </span>
              <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest">
                #{currentQuestion.order}
              </span>
            </div>

            {/* Question text */}
            <p className="relative text-base font-semibold text-slate-800 leading-relaxed mb-6">
              {currentQuestion.question}
            </p>

            {/* Answer textarea */}
            <motion.textarea
              whileFocus={{ boxShadow: "0 0 0 3px rgba(99,102,241,0.12)" }}
              value={currentQuestion.userAnswer || ""}
              onChange={handleChange}
              rows={5}
              placeholder="Type your answer here…"
              className="relative w-full text-sm text-slate-700 placeholder:text-slate-300 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none resize-none bg-slate-50/50 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all leading-relaxed"
            />

            {/* Navigation + Submit */}
            <div className="relative flex items-center gap-3 mt-4">
              {/* Prev */}
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
                Prev
              </motion.button>

              {/* Submit */}
              <motion.button
                whileHover={{
                  scale: 1.03,
                  y: -1,
                  boxShadow: "0 10px 28px rgba(99,102,241,0.35)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubmit(currentQuestion.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 transition-all cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                Submit Answer
              </motion.button>

              {/* Next */}
              {currentIndex < questions.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleNext}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
                >
                  Next
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" d="M5 12h14m-7-7 7 7-7 7" />
                  </svg>
                </motion.button>
              ) : (
                <div className="w-20" />
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Question dot navigator */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {questions.map((_, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (submittedIds.has(questions[i].id)) return;
              setDirection(i > currentIndex ? 1 : -1);
              setCurrentIndex(i);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
              i === currentIndex
                ? "bg-indigo-500 w-5"
                : "bg-slate-200 hover:bg-slate-300"
            }`}
          />
        ))}
      </div>

      {/* Toast */}
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
    </div>
  );
}

// ── Session Page ──────────────────────────────────────────────────────────────
function Session() {
  const { id, sessionId } = useParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const navigate = useNavigate();

  async function fetchQuestions() {
    try {
      setFetchingQuestions(true);
      const token = await getToken();
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/interviews/${id}/sessions/${sessionId}/questions`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setQuestions(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setFetchingQuestions(false);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, [id, sessionId]);

  async function handleEndSession() {
    try {
      setEndingSession(true);
      const token = await getToken();
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/interviews/${id}/sessions/${sessionId}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      navigate(-1);
    } catch (error) {
      console.log(error);
    } finally {
      setEndingSession(false);
    }
  }

  if (fetchingQuestions) return <LoadingOverlay text="Loading Questions…" />;
  if (endingSession) return <LoadingOverlay text="Ending Session…" />;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 font-sans">
      {/* Top nav */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/60"
      >
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
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
            <div className="text-sm font-bold text-slate-900 tracking-tight leading-none">
              Craftr
            </div>
            <div className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase">
              AI Session
            </div>
          </div>
        </div>

        {/* Live badge + End Session */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            />
            Session Active
          </div>

          <motion.button
            whileHover={{
              scale: 1.03,
              y: -1,
              boxShadow: "0 8px 20px rgba(239,68,68,0.3)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={handleEndSession}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-linear-to-br from-red-400 to-rose-500 text-white text-xs font-bold shadow-md shadow-red-200 cursor-pointer transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            End Session
          </motion.button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-8">
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
          Back
        </motion.button>

        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.12,
            type: "spring",
            stiffness: 260,
            damping: 26,
          }}
          className="mb-6"
        >
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Test Session
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Answer each question carefully — take your time
          </p>
        </motion.div>

        {/* Empty state */}
        {questions.length === 0 && !fetchingQuestions ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
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
              No questions found
            </div>
            <div className="text-sm text-slate-400 mt-1 mb-6">
              This session may have no questions yet.
            </div>
            <motion.button
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleEndSession}
              className="px-5 py-2.5 rounded-xl bg-linear-to-br from-red-400 to-rose-500 text-white text-sm font-semibold shadow-lg shadow-red-200 cursor-pointer"
            >
              End Session
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.18,
              type: "spring",
              stiffness: 240,
              damping: 26,
            }}
          >
            <QuestionCarousel
              data={questions}
              interviewId={id || ""}
              sessionId={sessionId || ""}
              onEnd={handleEndSession}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Session;
