import { useState, useEffect } from "react";
import type {
  Application,
  StatusConfig,
  FieldProps,
} from "../../types/applicationTracker";
import type { FormState } from "../../types/applicationDetails";
import { getToken } from "@clerk/react";
import axios from "axios";
import { motion, type Variants } from "framer-motion";
import ThreeDotsLoader from "../ThreeDotssLoader";

export default function UpdateApplicationModal({
  onClose,
  setApp,
  app,
}: {

  onClose: () => void;
  setApp: any;
  app: Application;
}) {
  const [form, setForm] = useState<FormState>({
    role: "",
    company: "",
    location: "",
    salary: "",
    status: "applied",
  });

  const [loading, setLoading] = useState<boolean>(false);

  const [, setErrors] = useState<Record<string, boolean>>({});

  // preload data
  useEffect(() => {
    if (app) {
      setForm({
        role: app.role || "",
        company: app.company || "",
        location: app.location || "",
        salary: app.salary || "",
        status: app.status?.toLowerCase() || "applied",
      });
    }
  }, [app]);

  const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1 } };

  const modalVar: Variants = {
    hidden: { opacity: 0, scale: 0.88, y: 30 },
    show: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 320, damping: 26 },
    },
    exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2 } },
  };

  const STATUS: Record<string, StatusConfig> = {
    applied: {
      label: "Applied",
      pill: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
    },
    shortlisted: {
      label: "Shortlisted",
      pill: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    },
    offer: {
      label: "Offer",
      pill: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    },
    rejected: {
      label: "Rejected",
      pill: "bg-red-50 text-red-400 ring-1 ring-red-100",
    },
    interview: {
      label: "Interview",
      pill: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
    },
  };

  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};

    if (!form.role.trim()) newErrors.role = true;
    if (!form.company.trim()) newErrors.company = true;
    if (!form.location.trim()) newErrors.location = true;
    if (!form.salary.trim()) newErrors.salary = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const setStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((f) => ({ ...f, status: e.target.value }));
  };

  const update = async () => {
    try {
      if (!validateForm()) return;
      setLoading(true);
      const token = await getToken();

      const response = await axios.patch(
        `http://localhost:5000/api/applications/${app.id}`,
        {
          ...form,
          status: form.status.toUpperCase(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const updatedApp = response.data.data;
      setApp(updatedApp);
      setLoading(false);
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="show"
      exit="hidden"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
    >
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-md">
          <ThreeDotsLoader text="Updating..." />
        </div>
      )}
      <motion.div
        variants={modalVar}
        initial="hidden"
        animate="show"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white/90 backdrop-blur-lg rounded-3xl border border-slate-200/60 shadow-2xl shadow-slate-300/50 p-7"
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Update Application
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Edit your application details
          </p>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field
            id="role"
            label="Job Title"
            value={form.role}
            setValue={(v) => setForm({ ...form, role: v })}
            placeholder="Updated Job role..."
          />
          <Field
            id="company"
            label="Company"
            value={form.company}
            setValue={(v) => setForm({ ...form, company: v })}
            placeholder="Updated company..."
          />
          <Field
            id="location"
            label="Location"
            value={form.location}
            setValue={(v) => setForm({ ...form, location: v })}
            placeholder="Updated location..."
          />
          <Field
            id="salary"
            label="Salary"
            value={form.salary}
            setValue={(v) => setForm({ ...form, salary: v })}
            placeholder="Updated salary..."
          />
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Status
          </label>
          <select
            value={form.status}
            onChange={setStatus}
            className="
              w-full mt-1 px-3.5 py-2.5 
              rounded-xl border border-slate-200 
              text-sm text-slate-800 bg-slate-50/50
              transition-all duration-200
              hover:border-slate-300 hover:bg-white
              focus:outline-none focus:border-indigo-400
              focus:ring-2 focus:ring-indigo-500/20 focus:bg-white
            "
          >
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            Cancel
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.03,
              y: -1,
              boxShadow: "0 10px 28px rgba(99,102,241,0.35)",
            }}
            whileTap={{ scale: 0.97 }}
            onClick={update}
            className="flex-1 py-2.5 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            Save Changes
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Field ---------- */

const Field: React.FC<FieldProps & { placeholder?: string }> = ({
  id,
  label,
  value,
  setValue,
  placeholder,
}) => {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold mb-1.5 text-slate-400 uppercase tracking-wider"
      >
        {label}
      </label>

      <input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="
          border border-slate-200 
          rounded-xl px-3.5 py-2.5
          text-sm bg-slate-50/50 text-slate-800
          placeholder:text-slate-300 shadow-sm
          transition-all duration-200 ease-out
          hover:border-slate-300 hover:bg-white hover:shadow-md
          focus:outline-none focus:border-indigo-400
          focus:ring-2 focus:ring-indigo-500/20 focus:bg-white
        "
      />
    </div>
  );
};
