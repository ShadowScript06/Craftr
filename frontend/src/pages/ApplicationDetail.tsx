import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import type {
 
  ApplicationDetailProps,
  AppData,
  Note,
 
} from "../types/applicationDetails";

import { STATUS_MAP } from "../types/applicationDetails";
import NoteCard from "../components/applicationDetails/NoteCard";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getToken } from "@clerk/react";
import JobDetailsSkeleton from "../components/applicationDetails/JobDetailsSkeleton";
import UpdateApplicationModal from "../components/applicationDetails/UpdateApplicationModal";
import ThreeDotsLoader from "../components/ThreeDotssLoader";

// ── Main Component ────────────────────────────────────────────────────────────
export default function ApplicationDetail( ){
  const [app, setApp] = useState<AppData | null>(null);
  const [notes, setNotes] = useState<Note[] | null>(null);

  const [noteText, setNoteText] = useState<string>("");

  const [editingNote, setEditingNote] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  let status;
  const [loading, setLoading] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [postingNote, setPostingNote] = useState<boolean>(false);
  const [deletingnote, setDeletingNote] = useState<boolean>(false);

  const navigate = useNavigate();
  if (app) {
    //@ts-ignore
    status = STATUS_MAP[app.status.toLowerCase()];
  }

  const { id } = useParams();

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.92 },
    show: { opacity: 1, scale: 1 },
  };

  async function fetchApplication() {
    try {
      
      const token = await getToken();
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/applications/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      console.log(error);
    } finally {
      setPostingNote(false);
    }
  }

  async function fetchNotes() {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/applications/${id}/notes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      console.log(error);
    }
  }

  const load = async () => {
    try {
      setLoading(true);
      const applicationData = await fetchApplication(); // async fetch
      setApp(applicationData);
      const notesData = await fetchNotes();
      setNotes(notesData);

      
      // ✅ safe inside async
    } catch (err: unknown) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  

  

  const postNote = async () => {
    if (!editingNote) {
      try {
        setPostingNote(true);
        if (!noteText.trim()) throw new Error("Note empty");

        const token = await getToken();
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/applications/${id}/notes`,
          { content: noteText },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setNotes((prev) => [response.data.data, ...(prev || [])]);

        setNoteText("");
      } catch (error) {
        console.log(error);
      }finally{
        setPostingNote(false);
      }
    } else {
      try {
        setPostingNote(true);
        if (!noteText.trim()) throw new Error("Note empty");

        const token = await getToken();
        const response = await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/applications/${id}/notes/${noteId}`,
          { content: noteText },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (notes) {
          const updatedNotes = notes.map((note) => {
            if (note.id === noteId) {
              return response.data.data;
            }
            return note;
          });

          setNotes(updatedNotes);
        }

        setNoteText("");
        setEditingNote(false);
      } catch (error) {
        console.log(error);
      }finally{
        setPostingNote(false);
      }
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      setDeletingNote(true);
      const token = await getToken();
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/applications/${id}/notes/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (notes) {
        const updatedNotes = notes.filter((note) => {
          return note.id !== noteId;
        });

        setNotes(updatedNotes);
      }

      setNoteText("");
      setEditingNote(false);
    } catch (error) {
      console.log(error);
    } finally {
      setDeletingNote(false);
    }
  };

  const startEdit = (note: Note): void => {
    setEditingNote(true);
    setNoteText(note.content);
    setNoteId(note.id);
    document.getElementById("note-textarea")?.focus();
  };

  const cancelEdit = (): void => {
    setEditingNote(false);
    setNoteText("");
  };

  if (postingNote) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-md">
        <ThreeDotsLoader text="Posting Note..." />
      </div>
    );
  }
  if (deletingnote) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-md">
        <ThreeDotsLoader text="Deleting Note..." />
      </div>
    );
  }
  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex font-sans">
      {/* ── Sidebar ── */}
      <motion.aside
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="w-72 shrink-0 border-r border-slate-200/60 bg-white/70 backdrop-blur-xl flex flex-col gap-5 p-6 max-h-screen"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200" 
          
          >
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

        {/* Nav */}
        <nav className="flex flex-col gap-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-2 mb-1">
            Workspace
          </div>
          <div className="text-[10px] font-semibold text-slate-300 uppercase tracking-widest px-2 mb-2">
            Executive Suite
          </div>
        </nav>

        <div className="mt-auto">
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200"
            onClick={()=>navigate('/applicationTracker')}
          >
            <span className="text-base leading-none">+</span>
            Add New Application
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
          <div className="flex items-center gap-3"></div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.08 }}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-slate-600"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </motion.button>
            <div className="w-8 h-8 rounded-xl bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              P
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="px-8 py-7 max-w-3xl mx-auto">
          {/* Back */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ x: -3 }}
            onClick={() => navigate("/applicationTracker")}
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
            Back to Applications
          </motion.button>
          {loading ? (
            <JobDetailsSkeleton />
          ) : (
            <>
              {app ? (
                <>
                  {/* Job Header Card */}
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
                    {/* Company row */}
                    <div className="flex items-center gap-2.5 mb-4">
                      <motion.div
                        whileHover={{ scale: 1.08, rotate: 4 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border border-black/5"
                        // style={{ background: app.logo.bg, color: app.logo.color }}
                      >
                        {app.company.slice(0, 2).toUpperCase()}
                      </motion.div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <span className="uppercase tracking-wider">
                          {app.company}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-400 font-normal">
                          Applied On {app.appliedAt.slice(0, 10)}
                        </span>
                      </div>
                    </div>

                    {/* Title + actions */}
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                          {app.role}
                        </h1>
                        <div className="flex items-center gap-3 flex-wrap">
                          <motion.span
                            key={app.status}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${status.pill}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                            {status.label}
                          </motion.span>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            {app.location}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {app.salary}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2.5 shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.04, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          className="px-4 py-2.5 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold shadow-lg shadow-indigo-200 whitespace-nowrap"
                          onClick={() => setShowUpdateModal(true)}
                        >
                          Edit Details
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>

                  {/* Activity & Notes Card */}
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
                          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
                        </svg>
                        <span className="text-sm font-semibold text-slate-800">
                          Activity & Notes
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
                        <motion.span
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                        />
                        Active Application
                      </div>
                    </div>

                    {/* Note composer */}
                    <div className="px-7 py-5 border-b border-slate-100">
                      <AnimatePresence>
                        {editingNote && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 mb-3 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-2 rounded-xl border border-amber-100"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Editing note
                            <button
                              onClick={cancelEdit}
                              className="ml-auto text-amber-400 hover:text-amber-600 transition-colors"
                            >
                              ✕ Cancel
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.textarea
                        id="note-textarea"
                        whileFocus={{
                          boxShadow: "0 0 0 3px rgba(99,102,241,0.12)",
                        }}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="What's the latest update? Type a note here…"
                        rows={4}
                        className="w-full text-sm text-slate-700 placeholder:text-slate-300 border border-slate-200 rounded-2xl px-4 py-3.5 outline-none resize-none bg-slate-50/50 focus:border-indigo-300 transition-all leading-relaxed"
                      />

                      <div className="flex items-center justify-end mt-3">
                        <motion.button
                          whileHover={{
                            scale: 1.04,
                            y: -1,
                            boxShadow: "0 8px 20px rgba(99,102,241,0.3)",
                          }}
                          whileTap={{ scale: 0.97 }}
                          onClick={postNote}
                          disabled={!noteText.trim()}
                          className="px-5 py-2 rounded-xl justify-self-end bg-linear-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold shadow-md shadow-indigo-200 disabled:opacity-40 transition-all"
                        >
                          {editingNote ? "Save Edit" : "Post Note"}
                        </motion.button>
                      </div>
                    </div>

                    {/* Notes timeline */}
                    <div className="px-7 py-6">
                      <AnimatePresence>
                        {(!notes || notes.length === 0) && (
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
                              📝
                            </motion.div>
                            <div className="text-sm font-semibold text-slate-600">
                              No notes yet
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              Add your first note above
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
                      >
                        <AnimatePresence>
                          {notes &&
                            notes.map((note) => (
                              <NoteCard
                                key={note.id}
                                note={note}
                                onDelete={() => deleteNote(note.id)}
                                onEdit={startEdit}
                              />
                            ))}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </motion.div>
                </>
              ) : (
                <>
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
                      No Application Found
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      Try checking User or application Id.
                    </div>
                  </motion.div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showUpdateModal && (
          <UpdateApplicationModal
            onClose={() => setShowUpdateModal(false)}
            setApp={setApp}
            app={app}
          />
        )}
      </AnimatePresence>

      {/* ── Status Modal ── */}
      {}

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
