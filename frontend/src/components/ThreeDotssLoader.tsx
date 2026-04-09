import { motion } from "framer-motion";

type Props = {
  size?: number;
  gap?: number;
  color?: string; // tailwind bg color
  text?: string;  // 👈 custom message
  speed?: number;
  className?: string;
};

export default function ThreeDotsLoader({
  size = 10,
  gap = 8,
  color = "bg-indigo-500",
  text,
  speed = 0.6,
  className = "",
}: Props) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      
      {/* Dots */}
      <div className="flex items-center justify-center" style={{ gap }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: speed,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.15,
            }}
            className={`
              ${color}
              rounded-full
              shadow-lg
            `}
            style={{
              width: size,
              height: size,
              boxShadow: "0 0 12px rgba(99,102,241,0.6)", // glow
            }}
          />
        ))}
      </div>

      {/* Optional Text */}
      {text && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-sm font-medium text-slate-500 tracking-wide"
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}