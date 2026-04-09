// ── Note Card ─────────────────────────────────────────────────────────────────
import { useState } from "react";
import type { NoteCardProps } from "../../types/applicationDetails";
import { motion ,AnimatePresence} from "framer-motion";

import { noteVar } from "../../types/applicationDetails";

export default function NoteCard({ note, onDelete, onEdit }: NoteCardProps) {
  const [hovering, setHovering] = useState<boolean>(false);

  return (
    <motion.div
      layout
      variants={noteVar}
      initial="hidden"
      animate="show"
      exit="exit"
      onHoverStart={() => setHovering(true)}
      onHoverEnd={() => setHovering(false)}
      className="relative flex gap-4"
    >
      {/* Timeline dot */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <motion.div
          animate={{
            scale: hovering ? 1.3 : 1,
            backgroundColor: hovering ? "#6366f1" : "#cbd5e1",
          }}
          transition={{ duration: 0.2 }}
          className="w-2.5 h-2.5 rounded-full bg-slate-300 z-10"
        />
        <div className="w-px flex-1 bg-slate-100 mt-1" />
      </div>

      {/* Card body */}
      <motion.div
        whileHover={{ y: -2, boxShadow: "0 8px 28px rgba(99,102,241,0.09)" }}
        className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-5 transition-shadow"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
              {note.createdAt.slice(0,10)}
            </span>
            
          </div>

          <AnimatePresence>
            {hovering && (
              <motion.div
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1"
              >
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "#f1f5f9" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onEdit(note)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1, backgroundColor: "#fef2f2" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(note.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="m19 6-.867 12.142A2 2 0 0 1 16.138 20H7.862a2 2 0 0 1-1.995-1.858L5 6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
      </motion.div>
    </motion.div>
  );
}