import axios from "axios";
interface GenerateInput {
  role: string;
  experience: number;
  description: string;
  topics: string[];
  previousQuestions?: string[];
}

// --------------------
// SAFE JSON EXTRACTOR
// --------------------
const extractJSON = (text: string) => {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1) {
    throw new Error("Invalid AI JSON structure");
  }

  return JSON.parse(cleaned.slice(start, end + 1));
};

// --------------------
// MAIN FUNCTION
// --------------------
export const generateInterviewContent = async (input: GenerateInput) => {
  const prompt = `
You are an expert interview question generator.

Your task is to generate exactly 10 high-quality interview questions.

Answer must be actual short answer and  acceptable in interview

The explanation must be VERY DETAILED like high-quality blog notes or study material atleast 200 words in detail.

If there is code example and complexity  can be given add that in explanation object for better understanding

---

INPUT:
- Role: ${input.role}
- Experience: ${input.experience}
- Description: ${input.description}
- Topics: ${input.topics.join(", ")}

---

STRICT RULES:
- Return ONLY valid JSON array
- NO markdown
- NO backticks
- NO explanations
- NO extra text
- MUST start with [ and end with ]
- NEVER return null anywhere
- NEVER return empty array 
- Atleast return 10 questions

---

QUESTION STRUCTURE (MUST FOLLOW EXACTLY):

[
  {
    "question": "string",
    "answer": "string",
    "explanation": {
      "type": "coding | theory | business | scenario | definition",
      "mainExplanation": "string",
      "codeExample": null,
      "complexity": {
        "time": null,
        "space": null
      }
    }
  }
]
`;

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a STRICT JSON generator.

RULES:
- Output ONLY valid JSON array
- No markdown
- No explanations
- No backticks
- No extra text
- main explaination must be thorough and brief like for complete understanding 
- If unsure, return []
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Interview AI Generator",
      },
    }
  );
 

  const text = response.data.choices[0].message.content;

  if (!text) {
    throw new Error("Empty AI response");
  }

  const parsed = extractJSON(text);

  if (!Array.isArray(parsed)) {
    throw new Error("AI did not return array");
  }

  // --------------------
  // DB MAPPING (UNCHANGED)
  // --------------------
  return parsed.map((q: any) => ({
    question: q.question,
    answer: q.answer ?? null,

    explaination: JSON.stringify({
      type: q.explanation.type,
      mainExplanation: q.explanation.mainExplanation,
      codeExample: q.explanation.codeExample ?? null,
      complexity: {
        time: q.explanation.complexity?.time ?? null,
        space: q.explanation.complexity?.space ?? null,
      },
    }),
  }));
};








export const generateMoreInterviewContent = async (input: GenerateInput) => {
  const prompt = `
You are an expert technical interview question generator.

Your task is to generate HIGH QUALITY, UNIQUE, and NEW interview questions that have NOT been asked before.

Answer must be actual short answer and  acceptable in interview

The explanation must be VERY DETAILED like high-quality blog notes or study material atleast 200 words in detail.

If there is code example and complexity  can be given add that in explanation object for better understanding

-----------------------------------

CANDIDATE INPUT:

Role: ${input.role}
Experience: ${input.experience} years
Description: ${input.description}
Topics: ${input.topics.join(", ")}

-----------------------------------

PREVIOUSLY ASKED QUESTIONS (STRICTLY AVOID THESE):

${
  input.previousQuestions?.length
    ? input.previousQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")
    : "None"
}

-----------------------------------

GENERATION RULES:

1. Generate ONLY fresh questions.
2. Do NOT repeat previous questions.
3. Do NOT rephrase excluded questions.
4. Do NOT generate duplicate concepts.
5. Each question must test a DIFFERENT skill area.
6. Prioritize real interview questions asked in product-based companies.
7. Questions must match candidate experience level.
8. Generate minimum 10 questions.
9. Never return empty array.
10.The main explaination must be thorough and brief for complete understanding.
11. If any generated question is similar to excluded list, replace it automatically.
12. Return ONLY pure valid JSON.
13. No markdown.
14. No extra text.
15. Start with [ and end with ].

-----------------------------------

OUTPUT FORMAT:

[
  {
    "question": "string",
    "topic": "string",
    "answer": "string",
    "explanation": {
      "type": "coding | theory | business | scenario | definition | performance",
      "mainExplanation": "string",
      "codeExample": "string or null",
      "complexity": {
        "time": "string or null",
        "space": "string or null"
      }
    }
  }
]

-----------------------------------

QUALITY CHECK BEFORE RETURNING:

- Are all questions unique?
- Are all different concepts?
- Are they relevant to ${input.role}?
- Is JSON valid?
- Minimum 10 questions included?

If any answer is NO, regenerate internally and return final valid JSON only.
`;

  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a STRICT JSON generator.

CRITICAL RULES:
- Output ONLY valid JSON array
- No markdown
- No explanations
- No repetition allowed under any condition
- If unsure, return []
          `,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4, // slightly higher = more diversity
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Interview AI Generator",
      },
    }
  );

  

  const text = response.data.choices[0].message.content;


  if (!text) throw new Error("Empty AI response");

  const parsed = extractJSON(text);

  if (!Array.isArray(parsed)) {
    throw new Error("AI did not return array");
  }
  

  // DB mapping (UNCHANGED)
  return parsed.map((q: any) => ({
    question: q.question,
    answer: q.answer ?? null,

    explaination: JSON.stringify({
      type: q.explanation.type,
      mainExplanation: q.explanation.mainExplanation,
      codeExample: q.explanation.codeExample ?? null,
      complexity: {
        time: q.explanation.complexity?.time ?? null,
        space: q.explanation.complexity?.space ?? null,
      },
    }),
  }));
};