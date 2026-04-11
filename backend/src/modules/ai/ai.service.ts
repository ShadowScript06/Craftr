import axios from "axios";

const dotenv = require("dotenv");
dotenv.config();

const client = axios.create({
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  },
});

interface Input {
  role: string;
  difficulty: string;
  durationMinutes: number;
  domain: string;
  experience: number;

}

interface RetryInput extends Input {
  previousQuestions?: string[];
}

const generateInterviewQuestions = async (input: Input) => {
  const { role, difficulty, durationMinutes, domain, experience } = input;

  const prompt=`You are an expert interview question generator for an AI-powered interview system.

Your task is to generate high-quality structured interview questions in STRICT JSON format.
Interview questions must be those which are asked  mostly in real world interviews

---

INPUT PARAMETERS:
- role: ${role}
- domain: ${domain}
- difficulty: ${difficulty}
- experience: ${experience}
- durationMinutes: ${durationMinutes}

---

QUESTION COUNT RULE:
- 15 min → 3 questions
- 30 min → 5 questions
- 45 min → 7 questions
- 60 min → 10 questions

---

DOMAIN RULES:
  → ONLY THEORY questions 
    Questions should test candidates theoritical knowledge  but mostly his real world understanding and practical application


---

STRICT OUTPUT RULES:
- Return ONLY valid JSON array
- NO markdown
- NO explanations
- NO backticks
- NO extra text
- NO null values anywhere

---

OUTPUT STRUCTURE (MUST FOLLOW EXACTLY):

{
  "type": "THEORY" ,
  "question": "string",
  "answer": "string",
  "language": "javascript | python | java | cpp | null",
  "starterCode": "string",
  "testCases": [
    {
      "input": "string",
      "output": "string",
      "explanation": "string"
    }
  ],
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "order": number
}

---



THEORY QUESTION RULES:
- type = "THEORY"
- answer = 3–6 line concise explanation
- language = null
- starterCode = ""
- testCases = []

---



---



ABSOLUTE RULES:
- NEVER return null anywhere
- NEVER skip fields
- ALWAYS return valid JSON array
- If unsure, generate best possible value instead of null`

  const response = await client.post("/chat/completions", {
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a STRICT JSON generator.

You NEVER return:
- markdown
- backticks
- explanations
- extra text

You ONLY return valid JSON array.

If you fail, output [] only.
`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const content = response.data.choices[0].message.content;

  const cleanContent = content
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

  let parsed;

  try {
    parsed = JSON.parse(cleanContent);
  } catch (err) {
    console.log("AI RAW OUTPUT:", content);
  throw new Error("Invalid JSON from AI");
  }

  if (!Array.isArray(parsed)) {
  throw new Error("AI did not return array");
}

  return parsed;
};


const evaluateInterview = async (payload: any[]) => {

  const prompt = `
You are an expert AI interviewer.

Evaluate the candidate based on their answers.

---

INPUT:
You are given a list of questions:
${JSON.stringify(payload)}

---

EVALUATION RULES:

1. THEORY:
- Check correctness, clarity, depth
- Partial answers = partial credit



---

SCORING:

- Evaluate each question
- Count correct answers
- totalCount = number of questions
- score = (correctCount / totalCount) * 100

---

RATING:

- 0–40 → Poor
- 41–60 → Average
- 61–80 → Good
- 81–100 → Excellent

---

OUTPUT FORMAT (STRICT JSON ONLY):

{
  "score": number,
  "rating": "Poor" | "Average" | "Good" | "Excellent",
  "correctCount": number,
  "totalCount": number,
  "feedback": "string",
  "strengths": "string",
  "weaknesses": "string",
  "timeTaken": number
}

---

STRICT RULES:
- NO markdown
- NO explanation
- NO backticks
- NO null values
- ALL fields must be present
- strengths & weaknesses = short paragraphs
- timeTaken = estimated total seconds
`;

  const response = await client.post("/chat/completions", {
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a STRICT JSON generator.

You ONLY return valid JSON.

If you fail, return:
{
  "score": 0,
  "rating": "Poor",
  "correctCount": 0,
  "totalCount": 0,
  "feedback": "Evaluation failed",
  "strengths": "None",
  "weaknesses": "Could not evaluate",
  "timeTaken": 0
}
        `,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3, // 🔥 lower = more consistent
  });

  const content = response.data.choices[0].message.content;

  // 🧹 Clean response
  const clean = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed;

  try {
    parsed = JSON.parse(clean);
  } catch (err) {
    console.error("AI RAW OUTPUT:", content);

    // 🔥 fallback (VERY IMPORTANT)
    return {
      score: 0,
      rating: "Poor",
      correctCount: 0,
      totalCount: payload.length,
      feedback: "AI response parsing failed",
      strengths: "N/A",
      weaknesses: "Could not evaluate answers",
      timeTaken: 0,
    };
  }

  // 🔒 HARD VALIDATION (CRITICAL)
  if (
    typeof parsed.score !== "number" ||
    !parsed.rating ||
    typeof parsed.correctCount !== "number"
  ) {
    throw new Error("Invalid AI evaluation structure");
  }

  return parsed;
};


const generateRetryQuestions = async (input: RetryInput) => {
  const {
    role,
    difficulty,
    durationMinutes,
    domain,
    experience,
    previousQuestions = [],
  } = input;

  const prompt = `
You are an expert interview question generator.

Generate a COMPLETELY NEW set of interview questions. 

Interview questions must be those which are asked  mostly in real world interviews

---

INPUT:
- role: ${role}
- domain: ${domain}
- difficulty: ${difficulty}
- experience: ${experience}
- durationMinutes: ${durationMinutes}

---

IMPORTANT:
This is a RETRY attempt.

You are given PREVIOUS QUESTIONS.
You MUST NOT:
- repeat them
- rephrase them
- test the same concepts

PREVIOUS QUESTIONS:
${previousQuestions.join("\n") || "None"}

---

QUESTION COUNT:
- 15 → 3
- 30 → 5
- 45 → 7
- 60 → 10

---

DOMAIN RULES:
 ONLY THEORY QUESTIONS

---

OUTPUT FORMAT (STRICT JSON ARRAY):

[
  {
    "type": "THEORY" | "CODING",
    "question": "string",
    "answer": "string",
    "language": "javascript | python | java | cpp | null",
    "starterCode": "string",
    "testCases": [
      {
        "input": "string",
        "output": "string"
      }
    ],
    "difficulty": "EASY" | "MEDIUM" | "HARD",
    "order": number
  }
]

---

STRICT RULES:
- NO markdown
- NO extra text
- NO null values
- ALWAYS return all fields
`;

  const response = await client.post("/chat/completions", {
    model: "openai/gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You ONLY return valid JSON array.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.6,
  });

  const content = response.data.choices[0].message.content;

  const clean = content.replace(/```json|```/g, "").trim();

  let parsed;

  try {
    parsed = JSON.parse(clean);
  } catch (err) {
    console.error("AI RETRY RAW:", content);
    throw new Error("Invalid AI retry response");
  }

  return parsed;
};

export const aiServices = {
  generateInterviewQuestions,
  evaluateInterview,generateRetryQuestions
};
