// ── Types ─────────────────────────────────────────────────────────────────────

export type StatusKey = "applied" | "interviewing" | "offer" | "rejected" | "saved";

export interface AppData {
  id: string;
  role: string;
  company: string;
  location: string;
  status: string;
  date: string;
  salary: string;
  starred: boolean;
  appliedAt: string;
}

export interface Note {
  id: string;
  createdAt: string;
  content: string;
}

export interface TagOption {
  label: string;
  color: string;
}

export interface StatusModalProps {
  current: StatusKey;
  onClose: () => void;
  onSave: (status: StatusKey) => void;
}

export interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onEdit: (note: Note) => void;
}

export interface ApplicationDetailProps {
  onBack?: () => void;
}

import type { Variants } from "framer-motion";


export interface FormState {
  role: string;
  company: string;
  location: string;
  salary: string;
  status: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────




// ── Status Config ─────────────────────────────────────────────────────────────

export const STATUS_MAP: Record<StatusKey, { label: string; pill: string }> = {
  applied:      { label: "Applied",      pill: "bg-blue-50 text-blue-600 ring-1 ring-blue-100"           },
  interviewing: { label: "Interviewing", pill: "bg-amber-50 text-amber-600 ring-1 ring-amber-100"        },
  offer:        { label: "Offer",        pill: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"  },
  rejected:     { label: "Rejected",     pill: "bg-red-50 text-red-400 ring-1 ring-red-100"              },
  saved:        { label: "Saved",        pill: "bg-violet-50 text-violet-600 ring-1 ring-violet-100"     },
};

export const STATUS_DOT_COLORS: Record<StatusKey, string> = {
  applied:      "bg-blue-400",
  interviewing: "bg-amber-400",
  offer:        "bg-emerald-400",
  rejected:     "bg-red-400",
  saved:        "bg-violet-400",
};

export const STATUSES: StatusKey[] = ["applied", "interviewing", "offer", "rejected", "saved"];

// ── Tag Options ───────────────────────────────────────────────────────────────

export const TAG_OPTIONS: TagOption[] = [
  { label: "General",        color: "bg-slate-50 text-slate-600 ring-1 ring-slate-200"       },
  { label: "Recruiter Call", color: "bg-blue-50 text-blue-600 ring-1 ring-blue-100"          },
  { label: "Preparation",    color: "bg-violet-50 text-violet-600 ring-1 ring-violet-100"    },
  { label: "Interview",      color: "bg-amber-50 text-amber-600 ring-1 ring-amber-100"       },
  { label: "Follow Up",      color: "bg-pink-50 text-pink-600 ring-1 ring-pink-100"          },
  { label: "Offer Details",  color: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" },
];

// ── Navigation Items ──────────────────────────────────────────────────────────

export const NAV_ITEMS: { label: string; icon: string; active: boolean }[] = [
  { label: "All Applications", icon: "M4 6h16M4 12h16M4 18h16",                                                                                                                                                                                                                                                                             active: false },
  { label: "Applied",          icon: "M5 12l5 5L20 7",                                                                                                                                                                                                                                                                                       active: false },
  { label: "Interviewing",     icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z",                                                                                                                                                                                                      active: true  },
  { label: "Offers",           icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",                                                                                                                                                                                                                                                    active: false },
  { label: "Rejected",         icon: "M10 14l2-2m0 0 2-2m-2 2-2-2m2 2 2 2m7-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",                                                                                                                                                                                                                             active: false },
];

// ── Framer Motion Variants ────────────────────────────────────────────────────

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1 },
};

export const noteVar: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { type: "spring", stiffness: 300, damping: 28 } },
  exit:   { opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.2 } },
};

export const modalVar: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 28 },
  show:   { opacity: 1, scale: 1,    y: 0,  transition: { type: "spring", stiffness: 320, damping: 26 } },
  exit:   { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.18 } },
};

export const toastVar: Variants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  show:   { opacity: 1, y: 0,  scale: 1,   transition: { type: "spring", stiffness: 400, damping: 28 } },
  exit:   { opacity: 0, y: 40, scale: 0.95, transition: { duration: 0.2 } },
};