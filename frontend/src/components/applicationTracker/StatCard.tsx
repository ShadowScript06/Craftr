import { motion } from "framer-motion";


const  StatCard = ({
    label,
    value,
    color = "text-slate-900",
  }: {
    label: string;
    value: number;
    color?: string;
  }) => (
    <motion.div
      whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(99,102,241,0.12)" }}
      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm cursor-default"
    >
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
        {label}
      </div>
      <motion.div
        key={value}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className={`text-2xl font-bold tracking-tight ${color}`}
      >
        {value}
      </motion.div>
    </motion.div>
  );

  export default StatCard;