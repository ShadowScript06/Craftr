import { motion, type Transition } from "framer-motion";

export default function JobDetailsSkeleton() {
  const shimmerTransition: Transition = {
    duration: 1.4,
    repeat: Infinity,
    ease: "easeInOut",
  };

  const shimmer = {
    animate: { opacity: [0.4, 0.9, 0.4] },
    transition: shimmerTransition,
  };

  return (
    <div className="space-y-6">
      {/* Job Header Card */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 p-7">
        
        {/* Company Row */}
        <div className="flex items-center gap-3 mb-5">
          <motion.div {...shimmer} className="w-10 h-10 rounded-xl bg-slate-200" />
          
          <div className="flex items-center gap-2">
            <motion.div {...shimmer} className="h-3 w-24 bg-slate-200 rounded-full" />
            <motion.div {...shimmer} className="h-3 w-3 bg-slate-200 rounded-full" />
            <motion.div {...shimmer} className="h-3 w-20 bg-slate-100 rounded-full" />
          </div>
        </div>

        {/* Title + Actions */}
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <motion.div {...shimmer} className="h-8 w-72 bg-slate-200 rounded-xl" />

            <div className="flex items-center gap-3 flex-wrap">
              <motion.div {...shimmer} className="h-5 w-20 bg-slate-200 rounded-full" />
              <motion.div {...shimmer} className="h-4 w-24 bg-slate-100 rounded-full" />
              <motion.div {...shimmer} className="h-4 w-16 bg-slate-100 rounded-full" />
            </div>
          </div>

          <div className="flex gap-3">
            <motion.div {...shimmer} className="h-10 w-28 bg-slate-200 rounded-xl" />
            <motion.div {...shimmer} className="h-10 w-32 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Activity & Notes Card */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/30 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <motion.div {...shimmer} className="w-4 h-4 bg-slate-200 rounded" />
            <motion.div {...shimmer} className="h-4 w-32 bg-slate-200 rounded-full" />
          </div>

          <motion.div {...shimmer} className="h-3 w-28 bg-slate-100 rounded-full" />
        </div>

        {/* Note Composer */}
        <div className="px-7 py-5 border-b border-slate-100 space-y-4">
          <motion.div {...shimmer} className="w-full h-24 bg-slate-200 rounded-2xl" />

          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <motion.div {...shimmer} className="h-8 w-20 bg-slate-200 rounded-lg" />
              <motion.div {...shimmer} className="h-8 w-8 bg-slate-100 rounded-lg" />
            </div>

            <motion.div {...shimmer} className="h-9 w-28 bg-slate-200 rounded-xl" />
          </div>
        </div>

        {/* Notes Timeline */}
        <div className="px-7 py-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              {...shimmer}
              className="h-16 w-full bg-slate-100 rounded-2xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}