import { prisma } from "../../prisma/client";
// AI layer
import { aiServices } from "../ai/ai.service";
import axios from "axios";
const dotenv = require("dotenv");

dotenv.config();

type StartSessionInput = {
  interviewId: string;
  userId: string;
  difficulty: string;
};

type EndSessionInput = {
  interviewId: string;
  sessionId: string;
  userId: string;
};

const startSession = async ({
  interviewId,
  userId,
  difficulty,
}: StartSessionInput) => {
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  const lastSession = await prisma.interviewSession.findFirst({
    where: { interviewId, userId },
    orderBy: { attempt: "desc" },
  });

  const attempt = lastSession ? lastSession.attempt + 1 : 1;

  // 1. Generate AI questions FIRST (outside transaction)
  const questions = await aiServices.generateInterviewQuestions({
    role: interview.role,
    domain: interview.domain,
    difficulty,
    experience: interview.experience,
    durationMinutes: interview.durationMinutes,
  });

  // 2. Run DB operations atomically
  const result = await prisma.$transaction(async (tx) => {
    // create session
    const session = await tx.interviewSession.create({
      data: {
        interviewId,
        userId,
        attempt,
        status: "IN_PROGRESS",
        difficulty,
      },
    });

    // create questions
    await tx.sessionQuestion.createMany({
      data: questions.map((q: any, index: number) => ({
        sessionId: session.id,
        question: q.question,
        type: q.type,
        answer: q.answer || "",
        order: index + 1,
      })),
    });

    // fetch first question
    const firstQuestion = await tx.sessionQuestion.findFirst({
      where: { sessionId: session.id },
      orderBy: { order: "asc" },
    });

    return {
      sessionId: session.id,
      attempt,
      totalQuestions: questions.length,
      firstQuestion,
    };
  });

  return result;
};

const endSession = async ({
  interviewId,
  sessionId,
  userId,
}: EndSessionInput) => {
  // 1. Validate session
  const session = await prisma.interviewSession.findFirst({
    where: {
      id: sessionId,
      interviewId,
      userId,
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  if (session.status === "COMPLETED") {
    throw new Error("Session already completed");
  }

  // 2. Fetch all questions + answers
  const questions = await prisma.sessionQuestion.findMany({
    where: { sessionId },
  });

  if (!questions.length) {
    throw new Error("No questions found for session");
  }

  // 3. Prepare AI payload
  const payload = questions.map((q) => ({
    question: q.question,
    expectedAnswer: q.answer,
    userAnswer: q.userAnswer,
    type: q.type,
  }));

  // 4. Call AI evaluation
  const evaluation = await aiServices.evaluateInterview(payload);

  // 🔒 Safety check (VERY IMPORTANT)
  if (
    evaluation.score === undefined ||
    !evaluation.rating ||
    evaluation.correctCount === undefined ||
    evaluation.totalCount === undefined
  ) {
    throw new Error("Invalid AI evaluation response");
  }

  // 5. Atomic DB transaction
  const result = await prisma.$transaction(async (tx) => {
    // create result
    const sessionResult = await tx.interviewSessionResult.create({
      data: {
        sessionId,
        score: evaluation.score,
        rating: evaluation.rating,
        correctCount: evaluation.correctCount,
        totalCount: evaluation.totalCount,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        timeTaken: evaluation.timeTaken,
      },
    });

    // update session
    await tx.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
      },
    });

    return sessionResult;
  });

  return result;
};

const retrySession = async ({
  interviewId,
  userId,
}: {
  interviewId: string;
  userId: string;
}) => {
  // 1. Validate interview
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  // 2. Get last attempt
  const lastSession = await prisma.interviewSession.findFirst({
    where: {
      interviewId,
      userId,
    },
    orderBy: {
      attempt: "desc",
    },
  });

  const attempt = lastSession ? lastSession.attempt + 1 : 1;

  // 3. Fetch ALL previous questions (for smarter retry)
  const previousQuestions = await prisma.sessionQuestion.findMany({
    where: {
      session: {
        interviewId,
        userId,
      },
    },
    select: {
      question: true,
    },
  });

  // 4. Generate NEW questions (retry AI)
  const questions = await aiServices.generateRetryQuestions({
    role: interview.role,
    domain: interview.domain,
    difficulty: "MEDIUM", // or pass dynamically
    experience: interview.experience,
    durationMinutes: interview.durationMinutes,
    previousQuestions: previousQuestions.map((q) => q.question),
  });

  if (!questions.length) {
    throw new Error("AI failed to generate retry questions");
  }

  // 5. Atomic DB transaction
  const result = await prisma.$transaction(async (tx) => {
    // create new session
    const session = await tx.interviewSession.create({
      data: {
        interviewId,
        userId,
        attempt,
        status: "IN_PROGRESS",
        difficulty: "MEDIUM", // align later if needed
      },
    });

    // insert questions
    await tx.sessionQuestion.createMany({
      data: questions.map((q: any, index: number) => ({
        sessionId: session.id,
        question: q.question,
        type: q.type,
        answer: q.answer || "",
        order: index + 1,
      })),
    });

    // fetch first question
    const firstQuestion = await tx.sessionQuestion.findFirst({
      where: { sessionId: session.id },
      orderBy: { order: "asc" },
    });

    return {
      sessionId: session.id,
      attempt,
      totalQuestions: questions.length,
      firstQuestion,
    };
  });

  return result;
};

const getSessionsByInterview = async ({
  interviewId,
  userId,
}: {
  interviewId: string;
  userId: string;
}) => {
  const sessions = await prisma.interviewSession.findMany({
    where: {
      interviewId,
      userId,
    },
    orderBy: {
      attempt: "desc",
    },
    include: {
      results: true, // ✅ your relation name
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  const formatted = sessions.map((s) => ({
    sessionId: s.id,
    attempt: s.attempt,
    status: s.status,
    totalQuestions: s._count.questions,

    // ✅ FIX for array
    score: s.results[0]?.score ?? null,
    rating: s.results[0]?.rating ?? null,

    createdAt: s.createdAt,
    endedAt: s.endedAt,
  }));

  return formatted;
};

const getSessionById = async ({
  interviewId,
  sessionId,
  userId,
}: {
  interviewId: string;
  sessionId: string;
  userId: string;
}) => {
  const session = await prisma.interviewSession.findFirst({
    where: {
      id: sessionId,
      interviewId,
      userId,
    },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
      results: true, // ⚠️ your current schema (array)
    },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  return {
    sessionId: session.id,
    attempt: session.attempt,
    status: session.status,
    difficulty: session.difficulty,
    createdAt: session.createdAt,
    endedAt: session.endedAt,

    questions: session.questions,

    // ⚠️ since results is array
    result: session.results[0] || null,
  };
};

const deleteSession = async ({
  sessionId,
  interviewId,
  userId,
}: {
  sessionId: string;
  interviewId: string;
  userId: string;
}) => {
  // 1. Check session ownership
  const session = await prisma.interviewSession.findFirst({
    where: {
      id: sessionId,
      interviewId,
      userId,
    },
  });

  if (!session) {
    throw new Error("Session not found or unauthorized");
  }

  // 2. Delete session (cascade handles rest)
  await prisma.interviewSession.delete({
    where: {
      id: sessionId,
    },
  });

  return {
    message: "Session deleted successfully",
  };
};

const submitAnswer = async ({
  sessionId,
  questionId,
  userId,
  answer,
}: {
  sessionId: string;
  questionId: string;
  userId: string;
  answer: string;
}) => {
  // 1. Validate session ownership
  const session = await prisma.interviewSession.findFirst({
    where: {
      id: sessionId,
      userId,
    },
  });

  if (!session) {
    throw new Error("Unauthorized or session not found");
  }

  // 2. Get question
  const question = await prisma.sessionQuestion.findUnique({
    where: { id: questionId },
  });

  if (!question || question.sessionId !== sessionId) {
    throw new Error("Question not found");
  }

  // 3. Update answer
  const updated = await prisma.sessionQuestion.update({
    where: { id: questionId },
    data: {
      userAnswer: answer,
      // if you have enum
    },
  });

  return updated;
};


const getSessionResult=async(sessionId:string)=>{
  const result=await prisma.interviewSessionResult.findUnique({
    where:{
      sessionId
    }
  });

  return result;
}
// export const runCode = async ({
//   interviewId,
//   sessionId,
//   questionId,
//   userId,
//   code,
//   language,
// }: {
//   interviewId: string;
//   sessionId: string;
//   questionId: string;
//   userId: string;
//   code: string;
//   language: string;
// }) => {
//   // 🔒 1. Validate session ownership
//   const session = await prisma.interviewSession.findFirst({
//     where: {
//       id: sessionId,
//       interviewId,
//       userId,
//     },
//   });

//   if (!session) {
//     throw new Error("Unauthorized or session not found");
//   }

//   // 🔒 2. Validate question belongs to session
//   const question = await prisma.sessionQuestion.findFirst({
//     where: {
//       id: questionId,
//       sessionId,
//     },
//   });

//   if (!question) {
//     throw new Error("Question not found for this session");
//   }

//   const testCases = question.testCases as {
//     input: string;
//     output: string;
//   }[];

//   if (!testCases || testCases.length === 0) {
//     throw new Error("No test cases found");
//   }

//   let passed = 0;
//   const results = [];

//   for (const tc of testCases) {
//     const wrappedCode = `${code}

//     const input = ${JSON.stringify(tc.input)};
//     const result = typeof solution === "function" ? solution(input) : null;

//       if (result !== undefined) {
//         console.log(result);
//       }
// `;


//     const PISTON_URL = "http://localhost:3000/execute";
//     const response = await axios.post(PISTON_URL, {
//       language,
//       version: "*",
//       files: [{ content: wrappedCode }],
//     });

//     const actual = response.data.run.output.trim();
//     const expected = String(tc.output).trim();

//     const isPassed = actual === expected;

//     if (isPassed) passed++;

//     results.push({
//       input: tc.input,
//       expected,
//       actual,
//       passed: isPassed,
//     });
//   }

//   return {
//     passed,
//     total: testCases.length,
//     results,
//   };
// };

export const sessionServices = {
  startSession,
  endSession,
  retrySession,
  getSessionsByInterview,
  getSessionById,
  deleteSession,
  submitAnswer,
  getSessionResult
};
