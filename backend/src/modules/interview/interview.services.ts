
import { prisma } from "../../prisma/client";

interface CreateInterviewInput {
  title: string;
  domain: string;
  role: string;
  experience: number;
  durationMinutes: number;
  userId: string;
  interviewType:string

}

async function createInterview(data: CreateInterviewInput) {
   const interview = await prisma.interview.create({
    data: {
      title: data.title,
      domain: data.domain,
      role: data.role,
      experience: data.experience,
      durationMinutes: data.durationMinutes,
      userId: data.userId,
      codingEnabled:data.domain==="TECH",interviewType:data.interviewType
    },
  });

  return interview;
}




 const getAllInterviews= async (userId: string) => {
  const interviews = await prisma.interview.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return interviews;
};


export const getInterviewById = async (
  interviewId: string,
  userId: string
) => {
  const interview = await prisma.interview.findFirst({
    where: {
      id: interviewId,
      userId: userId, // 🔒 ownership check
    },
  });

  return interview;
};




export const deleteInterview = async (
  interviewId: string,
  userId: string
) => {
  const deletedInterview = await prisma.interview.deleteMany({
    where: {
      id: interviewId,
      userId: userId,
    },
  });

  return deletedInterview;
};








export const interviewServices = {
  createInterview,
  getAllInterviews,
  getInterviewById,
  deleteInterview
};
