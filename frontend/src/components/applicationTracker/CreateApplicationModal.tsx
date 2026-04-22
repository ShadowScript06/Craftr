import { useState } from "react";
import type { Application,FormState,StatusConfig,FieldProps } from "../../types/applicationTracker";
import { getToken } from "@clerk/react";
import axios from "axios";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
export default function CreateApplicationModal({
  onClose,
  setApps,
  apps
}: {
  onClose: () => void;
  setApps:(a:Application[])=>void,
  apps:Application[]
}) {
  const [form, setForm] = useState<FormState>({
    role: "",
    company: "",
    location: "",
    salary: "",
    status: "applied",
  });

  const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1 } };
  const [, setErrors] = useState<Record<string, boolean>>({});
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



 

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};

    if (!form.role.trim()) newErrors.role = true;
    if (!form.company.trim()) newErrors.company = true;
    if (!form.location.trim()) newErrors.location = true;
    if (!form.salary.trim()) newErrors.salary = true;
    if (!form.source?.trim()) newErrors.source = true;
    if (!form.link?.trim()) newErrors.link = true;

    setErrors(newErrors);

    // return true if no errors
    return Object.keys(newErrors).length === 0;
  };

  // Set status to uppercase
  const setStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((f) => ({ ...f, status: e.target.value.toUpperCase() }));
  };

  // Apllication Submit
  const submit = async (setApps:(a:Application[])=>void,apps:Application[]) => {
    try {
      validateForm();

      const token = await getToken();
      const data = {
        company: form.company,
        role: form.role,
        link: form.link,
        source: form.source,
        location: form.location,
        salary: form.salary,
        status: form.status.toUpperCase(),
      };
      const response = await axios.post(
        `http://localhost:5000/api/applications`,

        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setApps([...apps, response.data.data])
      
      onClose();

      setForm({
        company:"",
        link:"",
        status:"Applied",
        salary:"",
        location:"",
        role:""
      });

      return response.data.data;
    } catch (error) {
      console.log(error);
    }

    //
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
      <motion.div
        variants={modalVar}
        initial="hidden"
        animate="show"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-slate-300/50 p-7"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            New Application
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track a new job you've applied to
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field
            id="role"
            label="Job Title"
            placeholder="Senior Designer"
            value={form.role}
            setValue={(newValue) => setForm({ ...form, role: newValue })}
          />

          <Field
            id="company"
            label="Company"
            placeholder="Stripe"
            value={form.company}
            setValue={(newValue) => setForm({ ...form, company: newValue })}
          />

          <Field
            id="location"
            label="Location"
            placeholder="Remote"
            value={form.location}
            setValue={(newValue) => setForm({ ...form, location: newValue })}
          />

          <Field
            id="salary"
            label="Salary"
            placeholder="$120k"
            value={form.salary}
            setValue={(newValue) => setForm({ ...form, salary: newValue })}
          />

          <Field
            id="source"
            label="Source"
            placeholder="LinkedIn, Naukri, etc."
            value={form.source || ""}
            setValue={(newValue) => setForm({ ...form, source: newValue })}
          />

          <Field
            id="link"
            label="Link"
            placeholder="careers.google.com"
            value={form.link || ""}
            setValue={(newValue) => setForm({ ...form, link: newValue })}
          />
        </div>

        <div className="flex flex-col gap-1 mb-6">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            Status
          </label>
          <select
            value={form.status}
            onChange={setStatus}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-slate-50 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
          >
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={()=>submit(setApps,apps)}
            className="flex-1 py-2.5 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-shadow"
          >
            Add Application
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}





//------------------------Feild----------------------------
const Field: React.FC<FieldProps> = ({
  id,
  label,
  placeholder,
  value,
  setValue,
}) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="text-sm font-medium mb-2 text-gray-700">
        {label}
      </label>
      <input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="
          border border-gray-300 
          rounded-lg 
          p-3 
          shadow-sm
          placeholder-gray-400
          text-gray-800
          focus:outline-none 
          focus:ring-2 
          focus:ring-indigo-300 
          focus:border-indigo-400
          transition 
          duration-200 
          ease-in-out
          hover:shadow-md
        "
      />
    </div>
  );
};