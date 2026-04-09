import { motion } from "framer-motion";


export default function SkeletonRow({ delay = 0 }: { delay?: number }) {
    const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-4 px-6 py-4 border-b border-slate-100"
    >
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        className="w-10 h-10 rounded-xl bg-slate-200 shrink-0"
      />
      <div className="flex-1 space-y-2">
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay + 0.1,
          }}
          className="h-3.5 bg-slate-200 rounded-full w-48"
        />
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay + 0.2,
          }}
          className="h-2.5 bg-slate-100 rounded-full w-28"
        />
      </div>
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 0.05,
        }}
        className="h-6 w-20 bg-slate-200 rounded-full"
      />
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 0.15,
        }}
        className="h-3 w-14 bg-slate-100 rounded-full"
      />
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 0.1,
        }}
        className="h-3 w-12 bg-slate-100 rounded-full"
      />
    </motion.div>
  );
}
