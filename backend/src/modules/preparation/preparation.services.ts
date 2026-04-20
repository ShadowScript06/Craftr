import { prisma } from "../../prisma/client";
import { generateInterviewContent, generateMoreInterviewContent } from "../ai/preparations.ai.service";

interface CreateSession {
  userId: string;
  role: string;
  experience: number;
  description: string;
  topicsToFocus: string[];
}
const createSession = async (data: CreateSession) => {
  const { userId, role, experience, description, topicsToFocus } = data;

  let fullSession;
  // 2. AI GENERATION (outside DB)
  const questions = await generateInterviewContent({
    role,
    experience,
    description,
    topics: topicsToFocus,
  });

  if (!questions?.length) {
    throw new Error("AI returned invalid response");
  }

  // 3. DB TRANSACTION (atomic save)

  const session = await prisma.$transaction(async (tx) => {
    const createdSession = await tx.preparationSession.create({
      data: {
        userId,
        role,
        experience,
        description,
      },
    });

    for (const topic of topicsToFocus) {
      const createdTopic = await tx.topic.create({
        data: {
          name: topic,
          sessionId: createdSession.id,
        },
      });
    }

    await tx.preparationQuestion.createMany({
      data: questions.map((q:any) => ({
        sessionId: createdSession.id,
        question: q.question,
        answer: q.answer,
        explaination: q.explaination,
      })),
    });

     fullSession = await tx.preparationSession.findUnique({
      where: {
        id: createdSession.id,
      },
      include: {
        topics: true,
      },
    });

    
  },{
    maxWait: 20000,
    timeout: 60000,
  });

  return fullSession;
};

const getSessionById = async (userId:string,sessionId:string) => {

    const session=await prisma.preparationSession.findUnique({
        where:{id:sessionId},
        include:{
            questions:true,
            topics:true
        }
    });

    if(!session || !(session.userId===userId)){
        return null;
    }
    return session;
};


const getAllSession = async (
    userId:string
) => {
    const sessions=await prisma.preparationSession.findMany({
        where:{
            userId:userId
        }
    });

    return sessions;
};
const deleteSession = async (
    userId:string, sessionId:string
) => {

    const deletedSession=await prisma.preparationSession.delete({
        where:{
            id:sessionId,
            userId:userId
        }
    });

    return deletedSession;
};


const generateMoreQuestions = async (userId:string,sessionId:string) => {
    
    const session= await getSessionById(userId,sessionId);

    if(!session){
        return null;
    }
    const prevQuestions=await prisma.preparationQuestion.findMany({
        where:{
            sessionId:sessionId
        }
    });

    const finalQuestions=prevQuestions.map((question)=>{
        return question.question
    });

    const topics=await prisma.topic.findMany({
        where:{
            sessionId:sessionId
        }
    });

    if(!topics){
        return
    }

    const finalTopics=topics.map((topic)=>{
        return topic.name
    });

  let fullSession;
  // 2. AI GENERATION (outside DB)
  const questions = await generateMoreInterviewContent({
    role:session.role,
    experience:session.experience,
    description:session.description,
    topics:finalTopics,
    previousQuestions:finalQuestions

  });

  if (!questions?.length) {
    throw new Error("AI returned invalid response");
  }

  // 3. DB TRANSACTION (atomic save)

  await prisma.$transaction(async (tx) => {
    await tx.preparationQuestion.createMany({
      data: questions.map((q:any) => ({
        sessionId: session.id,
        question: q.question,
        answer: q.answer,
        explaination: q.explaination,
      })),
    });

     fullSession = await tx.preparationSession.findUnique({
      where: {
        id: session.id,
      },
      include: {
        topics: true,
        questions:true
      },
    });

    
  },{
    maxWait: 20000,
    timeout: 60000,
  });

  return fullSession;
};


const preparationServices = {
  createSession,
  getAllSession,
  getSessionById,
  deleteSession,
  generateMoreQuestions
};

export default preparationServices;
