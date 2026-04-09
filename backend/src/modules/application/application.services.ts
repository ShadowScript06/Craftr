
import {prisma} from "../../prisma/client";


const createApplication=async (data:any,userId:string)=>{
    return prisma.application.create({
        data:{
            ...data,
            userId
        },
    });
};

const getAllApplications = async (userId: string) => {
  return prisma.application.findMany({
    where: { userId },
    orderBy: { appliedAt: "desc" },
  });
};

 const getApplicationById = async (applicationId: string, userId: string) => {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      userId,
    },
    include: { notes: true },
  });
};

const updateApplication = async (
  applicationId: string,
  userId: string,
  data: any
) => {

  const application=await prisma.application.findUnique({
    where:{
      userId:userId,
      id:applicationId
    }
  })

  if(!application){
    return null
  }
  return prisma.application.update({
    where: { id: applicationId },
    data,
  });
};


const createNote = async (data: any) => {
  return prisma.note.create({
    data,
  });
};

const getAllNotes = async (applicationId: string) => {
  return prisma.note.findMany({
    where: { applicationId },
    orderBy: { createdAt: "desc" },
  });
};


const updateNote = async (
  noteId: string,
  userId: string,
  content: string
) => {
  // 🔐 ensure note belongs to user's application
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      application: {
        userId: userId,
      },
    },
  });

  if (!note) return null;

  return prisma.note.update({
    where: { id: noteId },
    data: { content },
  });
};

 const deleteNote = async (
  noteId: string,
  userId: string
) => {
  // 🔐 verify ownership
  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      application: {
        userId: userId,
      },
    },
  });

  if (!note) return null;

  await prisma.note.delete({
    where: { id: noteId },
  });

  return true;
};

export const applicationServices={
    createApplication,
    getAllApplications,
    getApplicationById,
    updateApplication,
    createNote,
    getAllNotes,
    deleteNote,
    updateNote
}