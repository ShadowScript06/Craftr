import { useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useInView, type HTMLMotionProps } from "framer-motion";
import ScrollAnimation from "../components/ScrollAnimation";

// ── Indigo → Violet palette (replaces all blue) ──
const C = {
  indigo: "#6366f1", // indigo-500
  violet: "#7c3aed", // violet-600
  indigoDark: "#4338ca", // indigo-700  (solid accent text)
  outlineVariant: "#c3c5d9",
  secondary: "#565e74",
  outline: "#737688",
  surfaceContainer: "#ede9fe", // violet-tinted surface
  onBackground: "#0b1c30",
  onSurfaceVariant: "#434656",
  onSurface: "#0b1c30",
  surface: "#f8f9ff",
  background: "#f8f9ff",
  white: "#ffffff",
};

// ── Gradient strings ──
const GRAD = "linear-gradient(to right, #6366f1, #7c3aed)";
const GRAD_SUBTLE =
  "linear-gradient(to right, rgba(99,102,241,0.12), rgba(124,58,237,0.12))";

// ── Gradient text ──
const GradText = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={className}
    style={{
      background: GRAD,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}
  >
    {children}
  </span>
);

type GradBtnProps = HTMLMotionProps<"button"> & {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

// ── Gradient button ──
const GradBtn = ({
  children,
  className = "",
  style = {},
  ...props
}: GradBtnProps) => (
  <motion.button
    whileHover={{ scale: 1.04, boxShadow: "0 8px 30px rgba(124,58,237,0.35)" }}
    whileTap={{ scale: 0.96 }}
    className={`text-white font-bold rounded-xl shadow-lg ${className}`}
    style={{ background: GRAD, ...style }}
    {...props}
  >
    {children}
  </motion.button>
);

type IconProps = {
  name: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
};
// ── Icon ──
const Icon = ({ name, size = 24, className = "" }: IconProps) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{
      fontSize: size,
      fontVariationSettings: "'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24",
    }}
  >
    {name}
  </span>
);

type FadeUpProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

// ── FadeUp ──
const FadeUp = ({ children, delay = 0, className = "" }: FadeUpProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ════════════════════════════════════════
// NAV
// ════════════════════════════════════════
const Nav = () => (
  <header
    className="fixed top-0 w-full z-50 border-b border-white/10 bg-transparent"
    style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}
  >
    <div className="flex justify-between items-center max-w-7xl mx-auto px-8 lg:px-12 h-20">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="text-2xl font-black tracking-tight cursor-pointer"
      >
        <GradText>Craftr</GradText>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex items-center gap-4"
      >
        <button
          onClick={() => (window.location.href = "/login")}
          className="text-sm font-medium bg-linear-to-r from-violet-600 to-indigo-500 bg-clip-text text-transparent hover:opacity-80 transition-all duration-300 cursor-pointer"
        >
          Login
        </button>

        <button
          onClick={() => (window.location.href = "/signup")}
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-linear-to-r from-violet-600 to-indigo-500 hover:scale-105 transition-all duration-300 shadow-lg shadow-violet-500/20 cursor-pointer"
        >
          Get Started
        </button>
      </motion.div>
    </div>
  </header>
);

// ════════════════════════════════════════
// HERO
// ════════════════════════════════════════
const Hero = () => (
  <section
    className="relative overflow-hidden pt-4"
    style={{ backgroundColor: C.background }}
  >
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.35, scale: 1 }}
      transition={{ duration: 1.2 }}
      className="absolute top-0 right-0 -z-10 w-600px h-600px rounded-full -mr-48 -mt-48"
      style={{ background: GRAD, filter: "blur(80px)" }}
    />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.15 }}
      transition={{ duration: 1.5, delay: 0.3 }}
      className="absolute bottom-0 left-0 -z-10 w-400px h-400px rounded-full -ml-24 -mb-24"
      style={{ backgroundColor: C.violet, filter: "blur(80px)" }}
    />

    <div className="max-w-7xl mx-auto px-12 pt-4 pb-20 grid grid-cols-12 gap-6 items-center">
      <div className="col-span-12 lg:col-span-7">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
          style={{ backgroundColor: C.surfaceContainer }}
        >
          <motion.span
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="w-2 h-2 rounded-full"
            style={{ background: GRAD }}
          />
          <span
            className="text-xs font-bold tracking-widest"
            style={{ color: C.indigoDark }}
          >
            NEW: AI MOCK INTERVIEWS 2.0
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl font-extrabold leading-tight tracking-tight mb-4"
          style={{ color: C.onBackground }}
        >
          Your All-in-One <br />
          <GradText>Career Launchpad</GradText>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg leading-relaxed max-w-xl mb-12"
          style={{ color: C.onSurfaceVariant }}
        >
          Supercharge your professional journey with Craftr. From resume
          optimization to high-stakes mock interviews, we provide the
          intelligence you need to land your dream job.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <GradBtn className="text-sm px-8 py-4">Get Started Free</GradBtn>
          <motion.button
            whileHover={{ scale: 1.03, backgroundColor: C.surfaceContainer }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 font-semibold px-8 py-4 rounded-xl border transition-all"
            style={{
              color: C.onBackground,
              borderColor: C.outline,
              backgroundColor: "transparent",
            }}
          >
            <Icon name="play_circle" size={20} />
            Watch Demo
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 flex items-center gap-12"
        >
          <div className="flex -space-x-3">
            {[
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAc8eIRQ6MP340-xDfRPe85Al_RyUlnkCLHRQ79Ebr99aJdmxPYBqBBWmq7WMBXMFZAVdm3t-rteS8jv6TEtc0ugV7j5DI4wrUkdRi9uj7lfXBbgSWI7_UUYhg7PW1ylkvc1xz6BH9GFcG8_hwpAEpqu1bTBDQxx2x1fQzE52kCKh0p-WVam-ybPY2J1EK5IkEFUd-JrJszy8qSM7IWPFCW2kcyvq_2EIngZU9z4AFlQgOt0oBXztY9Imp1SgX_B6riUOk_dCxc7wzR",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAu63rTTwCZYTV-StztTf09PPZ2CjtsMvKieyiRjv48d6Em7RheSnTY4svTF2iOYDevKnNt58A1bMTMgyE8gpXd3p8wTeGY-VXyKeQkTvA3rhf7ePFdQ9TIJjr2JsizOt-USB519ZZW0KRA4UcMT-x75MWd9WCofBEhgF15Kt6wHmOaIBCsBLO39muC-ZbCEpWF5vyEq6wz9w9Nzac_KPKSUU1D-w6rmB2m7vsQjhzLzwzp778ZnDuVYPZssVPSoq21hsf4neWSdWO_",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBUJbXGchHTucQd2eoVtADGGvnEFzA_f_5S3FvsLzla0o0ig65WyQ0wo6qp6GatZKb68uRJKL1O38R9ER4fqWf-RJwySo4aOxZsPCwHincpujmaLFs0PwYQIKILtxQvJc0C-70HITrtSm_qMt2WB7kHDOj6RIr5D17qZ2g6ozkHDqdI9K4r4KqRLMRtlQg5PZn81JZHlea8dNMqsiNVGJm6lE2Ej4r-mgcJeQnlGPYhKio9oLhiA7QntZRYJot1LpX7eraxrGwG5hpm",
            ].map((src, i) => (
              <motion.img
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                src={src}
                alt="user"
                className="w-10 h-10 rounded-full border-2"
                style={{ borderColor: C.white }}
              />
            ))}
          </div>
          <p
            className="text-xs leading-5"
            style={{ color: C.onSurfaceVariant }}
          >
            <span className="font-bold" style={{ color: C.onBackground }}>
              2,400+
            </span>{" "}
            tech professionals <br />
            landed roles this month
          </p>
        </motion.div>
      </div>

      {/* Right cards */}
      <div className="col-span-12 lg:col-span-5 relative">
        <motion.div
          initial={{ opacity: 0, rotate: 4, y: 30 }}
          animate={{ opacity: 1, rotate: 2, y: 0 }}
          whileHover={{ rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 bg-white p-6 rounded-2xl border shadow-xl"
          style={{ borderColor: "#e2e8f0" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1.5">
              {["#f87171", "#fbbf24", "#34d399"].map((c) => (
                <div
                  key={c}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <span className="text-xs font-medium" style={{ color: C.outline }}>
              nexus_analysis.v2
            </span>
          </div>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAaS26kCvujM2STZfStx1KTwctBtNlWW2yNU5zURZ411o-EDW9wHKNUxCeYV3MskTCXCBfAMIV1FjcWYAnQcXYjCdf9Gqehc7eIHpz9SbTX-goMPw1cFmKMYwmSNSG2JKlk5hjq4NRJo_GO2ZGSnKXk7OZuzSBWcI82mtXBOI3BUTncxzTd9laoQaFVgXqIRRdQV3PBBMbdJT948UeCKPg3C4U2XaZT39klhd82DFYigUmmGgafyTyVwprMFfc85FuVcgSCctktuDky"
            className="rounded-lg w-full h-auto"
            alt="AI visualization"
          />
          <div
            className="mt-4 p-4 rounded-lg border"
            style={{
              backgroundColor: C.surfaceContainer,
              borderColor: "#ddd6fe",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs font-bold tracking-wide"
                style={{ color: C.indigoDark }}
              >
                Resume Strength
              </span>
              <span
                className="text-xs font-bold"
                style={{ color: C.indigoDark }}
              >
                94%
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden bg-white">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "94%" }}
                transition={{ duration: 1.2, delay: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: GRAD }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, rotate: -5, x: -20, y: 20 }}
          animate={{ opacity: 1, rotate: -3, x: 0, y: 0 }}
          whileHover={{ rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="absolute -bottom-10 -left-10 z-20 bg-white p-4 rounded-xl border shadow-lg"
          style={{ borderColor: "#e2e8f0" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Icon name="check_circle" size={22} />
            </div>
            <div>
              <p
                className="text-xs font-bold"
                style={{ color: C.onBackground }}
              >
                Interview Ready
              </p>
              <p className="text-xs" style={{ color: C.outline }}>
                Score: 8.5/10
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

// ════════════════════════════════════════
// CAREER JOURNEY
// ════════════════════════════════════════
const steps = [
  {
    icon: "upload_file",
    title: "1. Resume Upload",
    desc: "Drop your CV and let our AI parse your unique skill set.",
    side: "start",
  },
  {
    icon: "psychology",
    title: "2. AI Analysis",
    desc: "Receive deep insights into how recruiters view your profile.",
    side: "end",
  },
  {
    icon: "auto_stories",
    title: "3. Interview Prep",
    desc: "Get personalized study materials for your target roles.",
    side: "start",
  },
  {
    icon: "keyboard_voice",
    title: "4. Mock Test",
    desc: "Practice with our AI interviewer and refine your delivery.",
    side: "end",
  },
  {
    icon: "send",
    title: "5. Apply Jobs",
    desc: "Apply to verified high-match roles with one click.",
    side: "start",
  },
  {
    icon: "assignment_turned_in",
    title: "6. Track Applications",
    desc: "Stay organized with real-time pipeline visualization.",
    side: "end",
  },
  {
    icon: "celebration",
    title: "7. Offer Letter 🎉",
    desc: "Celebrate your success and start your new journey.",
    side: "center",
    special: true,
  },
];

type CareerStepData = {
  side: "start" | "end" | "center";
  icon: string;
  title: string;
  desc: string;
  special?: boolean;
  color?: string;
};

type CareerStepProps = {
  step: CareerStepData;
  index: number;
};

const CareerStep = ({ step, index }: CareerStepProps) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-30%" });
  const alignClass =
    step.side === "start"
      ? "self-start -translate-x-12"
      : step.side === "end"
        ? "self-end translate-x-12"
        : "self-center scale-110";

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        x: step.side === "start" ? -60 : step.side === "end" ? 60 : 0,
        y: 30,
      }}
      animate={
        inView
          ? { opacity: 1, x: 0, y: 0 }
          : {
              opacity: 0.3,
              x: step.side === "start" ? -20 : step.side === "end" ? 20 : 0,
            }
      }
      transition={{
        duration: 0.6,
        delay: 0.05 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`w-full max-w-md p-6 rounded-2xl flex items-center gap-6 ${alignClass}`}
      style={{
        background: inView ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.6)",
        backdropFilter: "blur(12px)",
        border: inView
          ? `1px solid ${step.special ? "#34d399" : C.indigo}`
          : "1px solid rgba(255,255,255,0.3)",
        boxShadow: inView
          ? "0 8px 32px rgba(99,102,241,0.12)"
          : "0 4px 16px rgba(0,0,0,0.04)",
        transition: "all 0.5s ease",
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white"
        style={{
          background: step.special ? "#34d399" : GRAD,
          boxShadow: step.special
            ? "0 4px 20px rgba(52,211,153,0.4)"
            : "0 4px 16px rgba(99,102,241,0.3)",
        }}
      >
        <Icon name={step.icon} size={22} />
      </div>
      <div>
        <h4 className="font-bold mb-1" style={{ color: C.onBackground }}>
          {step.title}
        </h4>
        <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
          {step.desc}
        </p>
      </div>
    </motion.div>
  );
};

const CareerJourney = () => {
  const titleRef = useRef(null);

  const titleInView = useInView(titleRef, {
    margin: "-35% 0px -35% 0px",
  });

  const steps = [
    {
      side: "start",
      icon: "🔥",
      title: "Started",
      desc: "...",
    },
    {
      side: "end",
      icon: "⚡",
      title: "Growth",
      desc: "...",
      special: true,
    },
  ] as const;

  return (
    <section className="relative z-30 -mt-screen py-20 overflow-hidden bg-transparent">
      <div className="max-w-7xl mx-auto px-12">
        <FadeUp className="text-center mb-16">
          <motion.div
            ref={titleRef}
            animate={{
              opacity: titleInView ? 1 : 0.45,
              scale: titleInView ? 1 : 0.96,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-block px-8 py-6 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${C.indigo}`,
              boxShadow: "0 8px 32px rgba(99,102,241,0.12)",
            }}
          >
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: C.onBackground }}
            >
              Your Path to the Top
            </h2>

            <p
              className="text-base max-w-2xl mx-auto"
              style={{ color: C.onSurfaceVariant }}
            >
              Scroll to see how Craftr accelerates your career progression from
              application to your dream offer letter.
            </p>
          </motion.div>
        </FadeUp>

        <div className="relative flex justify-center">
          <div className="absolute inset-0 flex justify-center">
            <div
              className="w-px h-full"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(124,58,237,0.3), transparent)",
              }}
            />
          </div>

          <div className="w-full max-w-4xl relative flex flex-col items-center gap-24 py-12">
            {steps.map((step, i) => (
              <CareerStep key={i} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ════════════════════════════════════════
// FEATURES
// ════════════════════════════════════════
const features = [
  {
    icon: "description",
    title: "AI Resume Analyzer",
    desc: "Instant scoring and actionable feedback on your resume based on thousands of successful job placements.",
    bullets: ["Keyword optimization", "ATS compatibility check"],
    cta: "Learn more",
  },
  {
    icon: "record_voice_over",
    title: "Interview Mastery",
    desc: "Interactive mock interviews with real-time feedback on your speech patterns, confidence, and technical accuracy.",
    bullets: ["500+ Role-specific banks", "Behavioral coaching"],
    cta: "Try mock test",
  },
  {
    icon: "work",
    title: "Smart Job Portal",
    desc: "We don't just list jobs; we match you with roles where your unique skills are most likely to get you an interview.",
    bullets: ["One-click application", "Predictive salary ranges"],
    cta: "Browse roles",
  },
];

const Features = () => (
  <section className="py-20" style={{ backgroundColor: C.white }}>
    <div className="max-w-7xl mx-auto px-12">
      <FadeUp className="text-center mb-16">
        <h2
          className="text-3xl font-bold mb-4"
          style={{ color: C.onBackground }}
        >
          Designed for Performance
        </h2>
        <p
          className="text-base max-w-2xl mx-auto"
          style={{ color: C.onSurfaceVariant }}
        >
          We've built a suite of AI-powered tools that cover every stage of your
          career journey, from the first application to the final negotiation.
        </p>
      </FadeUp>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <FadeUp key={f.title} delay={i * 0.1}>
            <motion.div
              whileHover={{
                borderColor: C.indigo,
                boxShadow: "0 20px 60px rgba(99,102,241,0.12)",
                y: -4,
              }}
              transition={{ duration: 0.25 }}
              className="p-8 rounded-2xl border h-full"
              style={{ borderColor: C.outlineVariant }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-white"
                style={{ background: GRAD }}
              >
                <Icon name={f.icon} size={28} />
              </motion.div>
              <h3
                className="text-xl font-semibold mb-4"
                style={{ color: C.onBackground }}
              >
                {f.title}
              </h3>
              <p
                className="text-base mb-6"
                style={{ color: C.onSurfaceVariant }}
              >
                {f.desc}
              </p>
              <ul className="space-y-3 mb-8">
                {f.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-center gap-2 text-sm"
                    style={{ color: C.onSurface }}
                  >
                    <Icon name="done" size={18} style={{ color: C.indigo }} />
                    {b}
                  </li>
                ))}
              </ul>
              <a
                href="#"
                className="flex items-center gap-1 text-sm font-bold transition-all hover:gap-3"
                style={{ color: C.indigoDark }}
              >
                {f.cta} <Icon name="arrow_forward" size={18} />
              </a>
            </motion.div>
          </FadeUp>
        ))}
      </div>
    </div>
  </section>
);

// ════════════════════════════════════════
// APP TRACKER
// ════════════════════════════════════════
const pipelineItems = [
  {
    icon: "cloud",
    title: "Product Designer",
    sub: "Salesforce • San Francisco",
    status: "Interviewing",
    statusStyle: {
      background: GRAD_SUBTLE,
      color: C.indigoDark,
      border: "1px solid rgba(99,102,241,0.2)",
    },
    highlight: true,
  },
  {
    icon: "shopping_bag",
    title: "Frontend Engineer",
    sub: "Stripe • Remote",
    status: "Offer Received",
    statusStyle: { backgroundColor: "#d1fae5", color: "#065f46" },
    highlight: false,
  },
  {
    icon: "category",
    title: "UX Researcher",
    sub: "Airbnb • Seattle",
    status: "Applied",
    statusStyle: { backgroundColor: "#f1f5f9", color: "#64748b" },
    highlight: false,
    dim: true,
  },
];

const AppTracker = () => (
  <section className="py-20" style={{ backgroundColor: C.surface }}>
    <div className="max-w-7xl mx-auto px-12">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        <FadeUp className="w-full lg:w-1/2">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ color: C.onBackground }}
          >
            Visualize Your Success
          </h2>
          <p className="text-base mb-10" style={{ color: C.onSurfaceVariant }}>
            Stop using messy spreadsheets. Our integrated Application Tracker
            provides a bird's-eye view of your entire job search pipeline, from
            initial contact to the final offer.
          </p>
          <div className="space-y-6">
            {[
              {
                n: "01",
                title: "Automated Updates",
                desc: "Statuses update automatically as you receive emails from recruiters.",
              },
              {
                n: "02",
                title: "Deadline Reminders",
                desc: "Never miss an assessment or a follow-up date with built-in alerts.",
              },
            ].map((item) => (
              <div key={item.n} className="flex items-start gap-4">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-white"
                  style={{ background: GRAD }}
                >
                  {item.n}
                </div>
                <div>
                  <h4
                    className="font-bold mb-1"
                    style={{ color: C.onBackground }}
                  >
                    {item.title}
                  </h4>
                  <p className="text-sm" style={{ color: C.onSurfaceVariant }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FadeUp>

        <FadeUp delay={0.15} className="w-full lg:w-1/2">
          <div
            className="bg-white rounded-3xl border shadow-2xl overflow-hidden"
            style={{ borderColor: "#e2e8f0" }}
          >
            <div
              className="px-8 py-6 border-b flex items-center justify-between"
              style={{ borderColor: "#f1f5f9" }}
            >
              <span className="font-bold" style={{ color: C.onBackground }}>
                My Pipeline
              </span>
              <div className="flex gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#e2e8f0" }}
                />
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#e2e8f0" }}
                />
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: GRAD }}
                />
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between mb-10">
                {[
                  { label: "Applied", val: "12", grad: true },
                  { label: "Interviewing", val: "4", grad: true, border: true },
                  { label: "Offers", val: "2", color: "#059669" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`text-center flex-1 ${stat.border ? "border-x" : ""}`}
                    style={{ borderColor: "#f1f5f9" }}
                  >
                    <div
                      className="text-xs font-semibold tracking-wide mb-2"
                      style={{ color: C.outline }}
                    >
                      {stat.label}
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="text-xl font-semibold"
                      style={
                        stat.grad
                          ? {
                              background: GRAD,
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              backgroundClip: "text",
                            }
                          : { color: stat.color }
                      }
                    >
                      {stat.val}
                    </motion.div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {pipelineItems.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: item.dim ? 0.5 : 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl border flex items-center justify-between"
                    style={{
                      borderColor: "#f1f5f9",
                      background: item.highlight
                        ? "linear-gradient(90deg,rgba(99,102,241,0.07) 0%,rgba(124,58,237,0.02) 100%)"
                        : C.white,
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center"
                        style={{ borderColor: "#f1f5f9" }}
                      >
                        <Icon
                          name={item.icon}
                          size={20}
                          className="text-slate-400"
                        />
                      </div>
                      <div>
                        <p
                          className="text-sm font-bold"
                          style={{ color: C.onBackground }}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs" style={{ color: C.outline }}>
                          {item.sub}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                      style={item.statusStyle}
                    >
                      {item.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>
      </div>
    </div>
  </section>
);

// ════════════════════════════════════════
// CTA
// ════════════════════════════════════════
const CTA = () => (
  <section className="py-20">
    <div className="max-w-5xl mx-auto px-12 text-center">
      <FadeUp>
        <div
          className="relative overflow-hidden p-12 rounded-[40px] text-white"
          style={{ background: GRAD }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">
              Ready to accelerate your career?
            </h2>
            <p
              className="text-lg mb-10 max-w-xl mx-auto"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              Join over 50,000 tech professionals who have used Craftr to land
              their next big role.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.04, backgroundColor: "#f5f3ff" }}
                whileTap={{ scale: 0.96 }}
                className="w-full sm:w-auto px-12 py-5 rounded-2xl font-extrabold transition-all"
                style={{ backgroundColor: C.white, color: C.indigoDark }}
              >
                Get Started Now
              </motion.button>
              <p
                className="text-sm font-semibold"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                No credit card required. Free forever tier.
              </p>
            </div>
          </div>
        </div>
      </FadeUp>
    </div>
  </section>
);

// ════════════════════════════════════════
// FOOTER
// ════════════════════════════════════════
const Footer = () => (
  <footer
    className="w-full border-t"
    style={{
      backgroundColor: "#f8fafc",
      borderColor: "#e2e8f0",
      fontFamily: "'Plus Jakarta Sans',sans-serif",
    }}
  >
    <div className="max-w-7xl mx-auto px-12 py-16 flex flex-col md:flex-row justify-between items-start gap-12">
      <div className="space-y-6 max-w-sm">
        <div className="text-xl font-bold">
          <GradText>Craftr</GradText>
        </div>
        <p className="text-sm" style={{ color: "#64748b" }}>
          Revolutionizing the way tech professionals find their dream jobs using
          cutting-edge artificial intelligence and behavioral science.
        </p>
        <div className="flex gap-4">
          {["share", "language", "public"].map((icon) => (
            <motion.a
              key={icon}
              href="#"
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                backgroundColor: "rgba(226,232,240,0.5)",
                color: "#475569",
              }}
            >
              <Icon name={icon} size={20} />
            </motion.a>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-12 flex-1">
        {[
          {
            title: "Product",
            links: ["Interview Prep", "Mock Tests", "Job Portal"],
          },
          {
            title: "Features",
            links: ["AI Resume", "Application Tracker", "Skill Mapping"],
          },
          {
            title: "Legal",
            links: ["Terms of Service", "Privacy Policy", "Cookie Policy"],
          },
        ].map((col) => (
          <div key={col.title} className="space-y-4">
            <h5 className="font-bold" style={{ color: C.onBackground }}>
              {col.title}
            </h5>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm underline underline-offset-4 transition-colors"
                    style={{ color: "#64748b" }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = C.indigo;
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = "#64748b";
                    }}
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
    <div
      className="max-w-7xl mx-auto px-12 pb-12 border-t pt-8"
      style={{ borderColor: "#e2e8f0" }}
    >
      <p className="text-sm text-center" style={{ color: "#64748b" }}>
        © 2024 Craftr. Empowering tech careers through intelligence.
      </p>
    </div>
  </footer>
);

// ════════════════════════════════════════
// ROOT
// ════════════════════════════════════════
export default function CraftrPage() {
  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif",
        backgroundColor: C.background,
      }}
    >
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />
      <Nav />
      <main className="pt-20">
        <Hero />
        <ScrollAnimation />
        <CareerJourney />
        <Features />
        <AppTracker />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
