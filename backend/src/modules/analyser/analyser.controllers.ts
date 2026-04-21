// src/controllers/resume.controller.ts

import { Request, Response } from "express";
import analyserServices from "./analyser.services";


/**
 * POST /api/resume/upload
 */
 const uploadResume = async (
  request: Request,
  response: Response
): Promise<void> => {
  try {
    const userId = (request as any).user.id;

    if (!request.file) {
      response.status(400).json({
        success: false,
        message: "Resume file is required",
      });
      return;
    }

    const {
      companyName,
      jobTitle,
      jobDescription,
    } = request.body;

    const createdResume =
  await analyserServices.uploadResume({
    userId,
    companyName,
    jobTitle,
    jobDescription,
    file: request.file as Express.Multer.File
  });

    response.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      data: createdResume,
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      success: false,
      message: "Failed to upload resume",
      error,
    });
  }
};

/**
 * POST /api/resume/analyze/:id
 */
 const analyzeResume = async (
  request: Request,
  response: Response
): Promise<void> => {
  try {
    const { id } = request.params as any;
    const userId = (request as any).user.id;
    const updatedResume =
      await analyserServices.analyzeResume(id,userId);

    response.status(200).json({
      success: true,
      message: "Resume analysis started",
      data: updatedResume,
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      success: false,
      message: "Failed to analyze resume",
      error,
    });
  }
};

/**
 * GET /api/resume/all
 */
 const getAllResumes = async (
  request: Request,
  response: Response
): Promise<void> => {
  try {
    const userId = (request as any).user.id;

    const resumes =
      await analyserServices.getAllResumes(
        userId
      );

    response.status(200).json({
      success: true,
      message: "All resumes fetched successfully",
      data: resumes,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: "Failed to fetch resumes",
      error,
    });
  }
};

/**
 * GET /api/resume/:id
 */
 const getResumeById = async (
  request: Request,
  response: Response
): Promise<void> => {
  try {
    const userId = (request as any).user.id;
    const { id } = request.params as any;

    const resume =
      await analyserServices.getResumeById(
        id,
        userId
      );

    if (!resume) {
      response.status(404).json({
        success: false,
        message: "Resume not found",
      });
      return;
    }

    response.status(200).json({
      success: true,
      message: "Resume fetched successfully",
      data: resume,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: "Failed to fetch resume",
      error,
    });
  }
};

/**
 * DELETE /api/resume/:id
 */
 const deleteResume = async (
  request: Request,
  response: Response
): Promise<void> => {
  try {
    const userId = (request as any).user.id;
    const { id } = request.params as any;

    const deletedResume =
      await analyserServices.deleteResume(
        id,
        userId
      );

    response.status(200).json({
      success: true,
      message: "Resume deleted successfully",
      data: deletedResume,
    });
  } catch (error) {
    response.status(500).json({
      success: false,
      message: "Failed to delete resume",
      error,
    });
  }
};

const analyserController= {
  uploadResume,
  analyzeResume,
  getAllResumes,
  getResumeById,
  deleteResume
} 

export default analyserController;