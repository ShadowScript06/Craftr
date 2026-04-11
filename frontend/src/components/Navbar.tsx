import { SignOutButton } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="sticky top-0 z-30 flex items-center justify-between px-8 py-4 bg-white/70 backdrop-blur-xl border-b border-slate-200/60"
    >
      {/* Left: Branding */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-3 cursor-pointer"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-200">
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
            Job Tracker
          </div>
        </div>
      </motion.div>

      {/* Right: Sign Out */}
      <motion.div
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 cursor-pointer"
      >
        <SignOutButton />
      </motion.div>
    </motion.nav>
  );
}