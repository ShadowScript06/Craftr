import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getToken } from "@clerk/react";
import { motion, AnimatePresence, type Transition, type Variants } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Resume {
  id: string;
  userId: string;
  jobTitle: string | null;
  jobDescription: string;
  companyName: string | null;
  extractedText: string;
  resumeUrl: string;
  previewImageUrl: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | string;
  createdAt: string;
  updatedAt: string;
}

const API = `${import.meta.env.VITE_BACKEND_URL}/analyse`;

// ── Skeleton ──────────────────────────────────────────────────────────────────
const shimmerTransition: Transition = { duration: 1.4, repeat: Infinity, ease: "easeInOut" };
const shimmer = { animate: { opacity: [0.4, 0.9, 0.4] }, transition: shimmerTransition };

function ResumeCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-md p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <motion.div {...shimmer} className="w-10 h-10 rounded-xl bg-slate-200" />
          <div className="space-y-1.5">
            <motion.div {...shimmer} className="h-3 w-28 bg-slate-200 rounded-full" />
            <motion.div {...shimmer} className="h-2.5 w-20 bg-slate-100 rounded-full" />
          </div>
        </div>
        <motion.div {...shimmer} className="h-5 w-20 bg-slate-200 rounded-full" />
      </div>
      <motion.div {...shimmer} className="h-3 w-3/4 bg-slate-100 rounded-full" />
      <motion.div {...shimmer} className="h-3 w-1/2 bg-slate-100 rounded-full" />
      <div className="flex gap-2 pt-1">
        <motion.div {...shimmer} className="h-8 flex-1 bg-slate-200 rounded-xl" />
        <motion.div {...shimmer} className="h-8 flex-1 bg-slate-200 rounded-xl" />
      </div>
    </div>
  );
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { pill: string; dot: string; label: string }> = {
  PENDING:     { pill: "bg-slate-100 text-slate-500 ring-slate-200",     dot: "bg-slate-400",   label: "Pending" },
  IN_PROGRESS: { pill: "bg-amber-50 text-amber-600 ring-amber-100",      dot: "bg-amber-400",   label: "In Progress" },
  COMPLETED:   { pill: "bg-emerald-50 text-emerald-600 ring-emerald-100", dot: "bg-emerald-400", label: "Completed" },
};

// ── Card palettes ─────────────────────────────────────────────────────────────
const CARD_PALETTES = [
  { grad: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-200", blob: "from-indigo-200/50 to-violet-200/30", pill: "bg-indigo-50 text-indigo-600 ring-indigo-100" },
  { grad: "from-emerald-400 to-teal-500",  shadow: "shadow-emerald-200", blob: "from-emerald-200/50 to-teal-200/30", pill: "bg-emerald-50 text-emerald-600 ring-emerald-100" },
  { grad: "from-amber-400 to-orange-500",  shadow: "shadow-amber-200",   blob: "from-amber-200/50 to-orange-200/30", pill: "bg-amber-50 text-amber-600 ring-amber-100" },
  { grad: "from-rose-400 to-pink-500",     shadow: "shadow-rose-200",    blob: "from-rose-200/50 to-pink-200/30",   pill: "bg-rose-50 text-rose-600 ring-rose-100" },
  { grad: "from-sky-400 to-blue-500",      shadow: "shadow-sky-200",     blob: "from-sky-200/50 to-blue-200/30",   pill: "bg-sky-50 text-sky-600 ring-sky-100" },
  { grad: "from-violet-500 to-purple-600", shadow: "shadow-violet-200",  blob: "from-violet-200/50 to-purple-200/30", pill: "bg-violet-50 text-violet-600 ring-violet-100" },
];

// ── Framer variants ───────────────────────────────────────────────────────────
const modalVar: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 30 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { type: "spring", stiffness: 320, damping: 26 } },
  exit:   { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2 } },
};

const cardVar: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
  exit:   { opacity: 0, y: -10, transition: { duration: 0.18 } },
};

const toastVar: Variants = {
  hidden: { opacity: 0, y: -40 },
  show:   { opacity: 1, y: 0,   transition: { type: "spring", stiffness: 320, damping: 26 } },
  exit:   { opacity: 0, y: -40, transition: { duration: 0.2 } },
};

// ── Upload Modal ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onSuccess }: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [file, setFile]                   = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [uploading, setUploading]         = useState(false);
  const [toast, setToast]                 = useState<string | null>(null);
  const [dragOver, setDragOver]           = useState(false);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleUpload = async () => {
    if (!file || !jobDescription.trim()) {
      showToast("Please attach a resume and add a job description.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);
      const token = await getToken();
      const uploadRes = await axios.post(`${API}/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resumeId = uploadRes.data.data.id;
      await axios.post(`${API}/${resumeId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      showToast("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div variants={toastVar} initial="hidden" animate="show" exit="exit"
            className="fixed top-6 right-6 z-[60] flex items-center gap-2.5 bg-red-500 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl shadow-red-200">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
            </svg>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={modalVar} initial="hidden" animate="show" exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-300/40 p-7 relative overflow-hidden"
      >
        {/* Blobs */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br from-indigo-200/40 to-violet-200/30 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/20 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="relative mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Upload Resume</h2>
            </div>
            <p className="text-xs text-slate-400 ml-10">We'll analyse it against the job description instantly</p>
          </div>
          <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Drop zone */}
        <div className="relative mb-4">
          <motion.div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            animate={{ borderColor: dragOver ? "#6366f1" : file ? "#10b981" : "#e2e8f0" }}
            className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
              dragOver ? "bg-indigo-50/50" : file ? "bg-emerald-50/30" : "bg-slate-50/50 hover:bg-slate-50"
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold text-slate-800 truncate max-w-48">{file.name}</div>
                  <div className="text-[11px] text-emerald-500 font-semibold">Ready to upload</div>
                </div>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="ml-auto text-slate-300 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-slate-600">Drop your resume here</div>
                <div className="text-xs text-slate-400 mt-1">or <span className="text-indigo-500 font-semibold">click to browse</span> · PDF, DOC, DOCX</div>
              </>
            )}
          </motion.div>
        </div>

        {/* Job description */}
        <div className="relative mb-5 flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Job Description</label>
          <motion.textarea
            whileFocus={{ boxShadow: "0 0 0 3px rgba(99,102,241,0.12)" }}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            placeholder="Paste the job description here so we can match your resume against it…"
            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50/50 text-slate-800 placeholder:text-slate-300 shadow-sm resize-none transition-all duration-200 hover:border-slate-300 hover:bg-white focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/25 focus:bg-white focus:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]"
          />
        </div>

        {/* Actions */}
        <div className="relative flex gap-3">
          <motion.button whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 cursor-pointer">
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1, boxShadow: "0 10px 28px rgba(99,102,241,0.35)" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleUpload}
            disabled={uploading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 transition-all duration-200 cursor-pointer"
          >
            {uploading ? (
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i}
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 rounded-full bg-white/80" />
                ))}
              </div>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Upload & Analyse
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResumeAnalyzerPage() {
  const [resumes, setResumes]     = useState<Resume[]>([]);
  const [loading, setLoading]     = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [toast, setToast]         = useState<string | null>(null);
  const navigate                  = useNavigate();

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios.get(`${API}`, { headers: { Authorization: `Bearer ${token}` } });
      setResumes(res.data.data || []);
    } catch (err) {
      console.error(err);
      showToast("Failed to load resumes.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (id: string) => {
    try {
      setAnalyzing(id);
      const token = await getToken();
      await axios.post(`${API}/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      await fetchResumes();
    } catch (err) {
      console.error(err);
      showToast("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(null);
    }
  };

  useEffect(() => { fetchResumes(); }, []);

  const completed  = resumes.filter((r) => r.status === "COMPLETED").length;
  const pending    = resumes.filter((r) => r.status === "PENDING" || r.status === "IN_PROGRESS").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex font-sans">

      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="w-72 shrink-0 border-r border-slate-200/60 bg-white/70 backdrop-blur-xl flex flex-col gap-5 p-6 max-h-screen sticky top-0"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200 cursor-pointer"
            onClick={() => navigate("/dashboard")}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 tracking-tight">Craftr</div>
            <div className="text-[10px] font-semibold text-indigo-400 tracking-widest uppercase">Resume Analyser</div>
          </div>
        </div>

        {/* Upload button */}
        <motion.button
          whileHover={{ scale: 1.03, y: -2, boxShadow: "0 12px 32px rgba(99,102,241,0.4)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 cursor-pointer"
        >
          <motion.span whileHover={{ rotate: 90 }} transition={{ type: "spring", stiffness: 400 }}
            className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-base leading-none">+</motion.span>
          Upload Resume
        </motion.button>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: "Total",     value: resumes.length, color: "text-indigo-600" },
            { label: "Completed", value: completed,       color: "text-emerald-500" },
            { label: "Pending",   value: pending,         color: "text-amber-500" },
            { label: "This Month",value: resumes.filter(r => new Date(r.createdAt).getMonth() === new Date().getMonth()).length, color: "text-violet-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-sm px-3 py-3 text-center">
              <div className={`text-xl font-black ${color}`}>{value}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Promo card */}
        <motion.div whileHover={{ scale: 1.02 }}
          className="rounded-2xl py-4 px-5 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 right-10 w-16 h-16 bg-white/5 rounded-full" />
          <div className="relative z-10">
            <div className="text-xs font-semibold opacity-70 mb-1 uppercase tracking-widest">AI Powered</div>
            <div className="text-xl font-black tracking-tight mb-0.5">Smart Match</div>
            <div className="text-[11px] opacity-60 mb-3">Tailored feedback per JD</div>
            <div className="text-[10px] font-semibold bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 inline-block backdrop-blur-sm">
              ✦ Instant Analysis
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
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 26 }}
          className="flex items-end justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resume Analyser</h1>
            <p className="text-sm text-slate-400 mt-0.5">Upload your resume and get instant AI-powered feedback</p>
          </div>
          <div className="flex gap-2">
            {[
              { label: "Total",     value: resumes.length, grad: "from-indigo-500 to-violet-600", shadow: "shadow-indigo-200" },
              { label: "Completed", value: completed,       grad: "from-emerald-400 to-teal-500",  shadow: "shadow-emerald-200" },
            ].map(({ label, value, grad, shadow }) => (
              <div key={label} className={`bg-gradient-to-br ${grad} text-white rounded-2xl px-4 py-2 text-center shadow-lg ${shadow}`}>
                <div className="text-xl font-black leading-none">{value}</div>
                <div className="text-[10px] font-semibold opacity-80 uppercase tracking-wider mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Card panel */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18, type: "spring", stiffness: 240, damping: 26 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 flex flex-col overflow-hidden flex-1"
        >
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
              <span className="text-sm font-semibold text-slate-800">Your Resumes</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={resumes.length} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="text-xs text-slate-400">
                {resumes.length} resume{resumes.length !== 1 ? "s" : ""}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto p-6">
            <AnimatePresence mode="wait">

              {/* Skeleton */}
              {loading && (
                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => <ResumeCardSkeleton key={i} />)}
                </motion.div>
              )}

              {/* Empty */}
              {!loading && resumes.length === 0 && (
                <motion.div key="empty" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 text-center">
                  <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="text-5xl mb-4">
                    📄
                  </motion.div>
                  <div className="text-base font-semibold text-slate-700">No resumes yet</div>
                  <div className="text-sm text-slate-400 mt-1 mb-6">Upload your first resume to get AI-powered feedback</div>
                  <motion.button
                    whileHover={{ scale: 1.04, y: -1, boxShadow: "0 10px 28px rgba(99,102,241,0.3)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 cursor-pointer"
                  >
                    + Upload First Resume
                  </motion.button>
                </motion.div>
              )}

              {/* Grid */}
              {!loading && resumes.length > 0 && (
                <motion.div key="grid" initial="hidden" animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.07 } } }}
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {resumes.map((r, idx) => {
                      const p          = CARD_PALETTES[idx % CARD_PALETTES.length];
                      const statusCfg  = STATUS_CONFIG[r.status] ?? STATUS_CONFIG["PENDING"];
                      const initials   = (r.companyName ?? r.jobTitle ?? "RS").slice(0, 2).toUpperCase();
                      const isAnalyzing = analyzing === r.id;

                      return (
                        <motion.div
                          key={r.id}
                          variants={cardVar} initial="hidden" animate="show" exit="exit"
                          whileHover={{ y: -4, boxShadow: "0 20px 48px rgba(0,0,0,0.08)" }}
                          className="relative bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200/60 shadow-md p-5 flex flex-col gap-4 overflow-hidden group cursor-default"
                        >
                          {/* Blob */}
                          <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full bg-gradient-to-br ${p.blob} blur-2xl pointer-events-none`} />
                          {/* Bottom accent */}
                          <div className={`absolute bottom-0 left-5 right-5 h-0.5 rounded-full bg-gradient-to-r ${p.grad} opacity-30`} />

                          {/* Top row */}
                          <div className="flex items-start justify-between gap-2 relative">
                            <div className="flex items-center gap-2.5">
                              <motion.div
                                whileHover={{ scale: 1.12, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400 }}
                                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.grad} flex items-center justify-center text-xs font-black text-white shadow-lg ${p.shadow} shrink-0`}
                              >
                                {initials}
                              </motion.div>
                              <div>
                                <div className="text-[11px] font-bold text-slate-700 truncate max-w-32">
                                  {r.companyName ?? "No Company"}
                                </div>
                                <div className="text-[10px] text-slate-300 font-medium mt-0.5">
                                  {r.createdAt?.slice(0, 10)}
                                </div>
                              </div>
                            </div>

                            {/* Status pill */}
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 shrink-0 ${statusCfg.pill}`}>
                              <motion.span
                                animate={r.status === "IN_PROGRESS" ? { opacity: [1, 0.3, 1] } : {}}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}
                              />
                              {statusCfg.label}
                            </span>
                          </div>

                          {/* Job title */}
                          <div className="relative">
                            <div className="text-sm font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors duration-200 truncate">
                              {r.jobTitle ?? "Untitled Position"}
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {r.jobDescription?.slice(0, 100)}{r.jobDescription?.length > 100 ? "…" : ""}
                            </p>
                          </div>

                          {/* Preview image */}
                          {r.previewImageUrl && (
                            <div className="relative rounded-xl overflow-hidden border border-slate-100 h-24 bg-slate-50">
                              <img src={r.previewImageUrl} alt="Resume preview" className="w-full h-full object-cover object-top" />
                              <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent" />
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="relative flex gap-2">
                            {r.status !== "COMPLETED" && (
                              <motion.button
                                whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }}
                                onClick={() => handleAnalyze(r.id)}
                                disabled={isAnalyzing}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-200 transition-all cursor-pointer disabled:opacity-60"
                              >
                                {isAnalyzing ? (
                                  <div className="flex gap-1">
                                    {[0, 1, 2].map((i) => (
                                      <motion.div key={i}
                                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.12 }}
                                        className="w-1 h-1 rounded-full bg-white/80" />
                                    ))}
                                  </div>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Analyse
                                  </>
                                )}
                              </motion.button>
                            )}

                            <motion.button
                              whileHover={{ scale: 1.03, y: -1, boxShadow: "0 8px 20px rgba(99,102,241,0.2)" }} whileTap={{ scale: 0.97 }}
                              onClick={() => navigate(`/analyser/${r.id}`)}
                              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer bg-gradient-to-br ${p.grad} ${p.shadow} ${r.status !== "COMPLETED" ? "flex-1" : "w-full"}`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              View Feedback
                            </motion.button>
                          </div>
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

      {/* ── Upload Modal ── */}
      <AnimatePresence>
        {showModal && (
          <UploadModal
            onClose={() => setShowModal(false)}
            onSuccess={fetchResumes}
          />
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div variants={toastVar} initial="hidden" animate="show" exit="exit"
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-red-500 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl shadow-red-200">
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