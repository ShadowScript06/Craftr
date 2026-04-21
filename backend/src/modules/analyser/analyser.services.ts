import { prisma } from "../../prisma/client";
import { aiServices } from "../ai/ai.service";

/**
 * Create Resume Record
 */
export const uploadResume = async (payload: {
  userId: string;
  companyName?: string;
  jobTitle?: string;
  jobDescription: string;
  file: Express.Multer.File;
})=> {
  const processedResume = await processResumeUpload(payload.file);

  const createdResume = await prisma.resume.create({
    data: {
      userId: payload.userId,
      companyName: payload.companyName,
      jobTitle: payload.jobTitle,
      jobDescription: payload.jobDescription,
      resumeUrl: processedResume.resumeUrl,
      extractedText: processedResume.extractedText,
      status: "PENDING",
    },
  });

  return createdResume;
};

/**
 * Analyze Resume
 */
export const analyzeResume = async (
  resumeId: string,
  userId: string
) => {
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
    },
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  await prisma.resume.update({
    where: { id: resumeId },
    data: { status: "PROCESSING" },
  });

  try {
    const aiResponse =
      await aiServices.analyzeResumeWithAI(
        resume.extractedText,
        resume.jobDescription
      );

    await prisma.feedback.upsert({
      where: {
        resumeId: resume.id,
      },
      update: {
        overallScore: aiResponse.overallScore,
        atsScore: aiResponse.atsScore,
        tone: aiResponse.tone,
        content: aiResponse.content,
        structure: aiResponse.structure,
        skills: aiResponse.skills,
        summary: aiResponse.summary,
        suggestions: aiResponse.suggestions,
      },
      create: {
        resumeId: resume.id,
        overallScore: aiResponse.overallScore,
        atsScore: aiResponse.atsScore,
        tone: aiResponse.tone,
        content: aiResponse.content,
        structure: aiResponse.structure,
        skills: aiResponse.skills,
        summary: aiResponse.summary,
        suggestions: aiResponse.suggestions,
      },
    });

    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: "COMPLETED" },
    });

    return {
      resumeId: resume.id,
      status: "COMPLETED",
      feedback: aiResponse,
    };

  } catch (error) {

    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: "FAILED" },
    });

    throw error;
  }
};
/**
 * Get All User Resumes
 */
export const getAllResumes = async (userId: string) => {
  const resumes = await prisma.resume.findMany({
    where: {
      userId,
    },
    include: {
      feedback: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return resumes;
};

/**
 * Get Resume By Id
 */
export const getResumeById = async (resumeId: string, userId: string) => {
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId,
    },
    include: {
      feedback: true,
    },
  });

  return resume;
};

/**
 * Delete Resume
 */
export const deleteResume = async (resumeId: string, userId: string) => {
  const deletedResume = await prisma.resume.deleteMany({
    where: {
      id: resumeId,
      userId,
    },
  });

  return deletedResume;
};

const analyserServices = {
  uploadResume,
  analyzeResume,
  deleteResume,
  getResumeById,
  getAllResumes,
};

export default analyserServices;

import streamifier from "streamifier";

import cloudinary from "../../config/lib/cloudinary";

/**
 * Upload resume file to Cloudinary
 */
export const uploadResumeToCloudinary = async (
  file: Express.Multer.File,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "resumes",
        resource_type: "raw", // for pdf/doc/docx
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result?.secure_url || "");
      },
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

/**
 * Extract text from PDF file
 */



const { PDFParse } = require("pdf-parse");

export const extractTextFromPdf = async (resumeurl:string) => {
  const parser = new PDFParse({url:resumeurl});

  const result = await parser.getText();

  return result.text || "";
};

/**
 * Upload + Extract Combined Layer
 */
export const processResumeUpload = async (file: Express.Multer.File) => {
  const resumeUrl = await uploadResumeToCloudinary(file);

  let extractedText = "";

  if (file.mimetype === "application/pdf") {
    extractedText = await extractTextFromPdf(resumeUrl);
  }

  return {
    resumeUrl,
    extractedText,
  };
};
