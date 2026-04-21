import { getToken } from "@clerk/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface Feedback {
  id: string;
  resumeId: string;
  overallScore: number;
  atsScore: number;
  content: { score: number; feedback: string };
  skills: { score: number; missing: string[]; feedback: string };
  structure: { score: number; feedback: string };
  tone: { score: number; feedback: string };
  summary: string;
  suggestions: string[];
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  jobTitle: string | null;
  jobDescription: string;
  companyName: string | null;
  extractedText: string;
  resumeUrl: string;
  previewImageUrl: string | null;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | string;
  feedback: Feedback;
  createdAt: string;
}

export default function ResumeFeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);

  const API = "http://localhost:5000/api/analyse";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const token = await getToken();
        const res = await axios.get(`${API}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setResume(res.data.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ---------------- LOADING UI (SKELETON) ---------------- */

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <div style={styles.skeletonBack} />
          <div style={styles.skeletonTitle} />
        </div>

        <div style={styles.card}>
          <div style={styles.skeletonLine} />
          <div style={styles.skeletonLine} />
          <div style={styles.skeletonLine} />
        </div>

        <div style={styles.card}>
          <div style={styles.skeletonGrid}>
            <div style={styles.skeletonBox} />
            <div style={styles.skeletonBox} />
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.skeletonLine} />
          <div style={styles.skeletonLine} />
          <div style={styles.skeletonLine} />
        </div>
      </div>
    );
  }

  if (!resume) {
    return <div style={styles.page}>No data found</div>;
  }

  const feedback = resume.feedback;

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div>
          <h2 style={styles.title}>Resume Analysis</h2>
          <p style={styles.subtitle}>
            AI-powered feedback report
          </p>
        </div>
      </div>

      {/* META CARD */}
      <div style={styles.card}>
        <p><b>Status:</b> {resume.status}</p>
        <p><b>Company:</b> {resume.companyName || "N/A"}</p>
        <p><b>Role:</b> {resume.jobTitle || "N/A"}</p>
      </div>

      {!feedback ? (
        <div style={styles.card}>
          No feedback generated yet.
        </div>
      ) : (
        <>
          {/* SCORES */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Performance Scores</h3>

            <div style={styles.grid}>
              <div style={styles.scoreCard}>
                <p>ATS Score</p>
                <h1>{feedback.atsScore}</h1>
              </div>

              <div style={styles.scoreCardAlt}>
                <p>Overall Score</p>
                <h1>{feedback.overallScore}</h1>
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Summary</h3>
            <p style={styles.text}>{feedback.summary}</p>
          </div>

          {/* SUGGESTIONS */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Improvement Suggestions</h3>
            <ul>
              {feedback.suggestions.map((s, i) => (
                <li key={i} style={styles.listItem}>{s}</li>
              ))}
            </ul>
          </div>

          {/* SKILLS */}
          <div style={styles.card}>
            <h3 style={styles.sectionTitle}>Skills Analysis</h3>

            <p><b>Score:</b> {feedback.skills.score}</p>

            <p><b>Missing Skills</b></p>
            <ul>
              {feedback.skills.missing.map((m, i) => (
                <li key={i} style={styles.listItem}>{m}</li>
              ))}
            </ul>

            <p style={styles.text}>{feedback.skills.feedback}</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: 24,
    fontFamily: "sans-serif",
    background: "#0b1220",
    minHeight: "100vh",
    color: "#e5e7eb",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
  },

  backBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #1f2937",
    background: "#111827",
    color: "#e5e7eb",
    cursor: "pointer",
  },

  title: {
    margin: 0,
    fontSize: 22,
  },

  subtitle: {
    margin: 0,
    fontSize: 12,
    color: "#9ca3af",
  },

  card: {
    background: "#111827",
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    border: "1px solid #1f2937",
  },

  sectionTitle: {
    marginBottom: 10,
  },

  grid: {
    display: "flex",
    gap: 12,
  },

  scoreCard: {
    flex: 1,
    background: "#1d4ed8",
    padding: 16,
    borderRadius: 12,
    textAlign: "center",
  },

  scoreCardAlt: {
    flex: 1,
    background: "#059669",
    padding: 16,
    borderRadius: 12,
    textAlign: "center",
  },

  text: {
    lineHeight: 1.6,
    color: "#d1d5db",
  },

  listItem: {
    marginBottom: 6,
  },

  /* ---------- SKELETON ---------- */

  skeletonBack: {
    width: 80,
    height: 36,
    background: "#1f2937",
    borderRadius: 8,
    animation: "pulse 1.5s infinite",
  },

  skeletonTitle: {
    width: 180,
    height: 24,
    background: "#1f2937",
    borderRadius: 6,
    animation: "pulse 1.5s infinite",
  },

  skeletonLine: {
    width: "100%",
    height: 14,
    background: "#1f2937",
    marginBottom: 10,
    borderRadius: 6,
    animation: "pulse 1.5s infinite",
  },

  skeletonGrid: {
    display: "flex",
    gap: 12,
  },

  skeletonBox: {
    flex: 1,
    height: 80,
    background: "#1f2937",
    borderRadius: 12,
    animation: "pulse 1.5s infinite",
  },
};

/* Add global animation */
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
`, styleSheet.cssRules.length);