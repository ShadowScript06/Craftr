import { success } from "zod";
import { interviewServices } from "./interview.services";
import { Request, Response } from "express";

async function createInterview(request: Request, response: Response) {
  try {
    const userId = (request as any).user?.id;

    const data = request.body;

    const interview = await interviewServices.createInterview({
      ...data,
      userId,
    });

    // 4. response
    return response.status(201).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
}

const getAllInterviews = async (request: Request, response: Response) => {
  try {
     const userId = (request as any).user?.id;

    const interviews = await interviewServices.getAllInterviews(userId);

    return response.status(200).json({
      success: true,
      interviews,
    });
  } catch (error: any) {
    return response.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

const getInterviewById = async (request: Request, response: Response) => {
  try {
     const userId = (request as any).user?.id;
    const interviewId = request.params.interviewId as any;

    if (!userId) {
      return response.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const interview = await interviewServices.getInterviewById(
      interviewId,
      userId,
    );

    if (!interview) {
      return response.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    return response.status(200).json({
      success: true,
      interview,
    });
  } catch (error: any) {
    return response.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};

export const deleteInterview = async (request: Request, response: Response) => {
  try {
    const userId = (request as any).user?.id;
    const interviewId = request.params.interviewId as any;

    if (!userId) {
      return response.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await interviewServices.deleteInterview(interviewId, userId);

    if (result.count === 0) {
      return response.status(404).json({
        success: false,
        message: "Interview not found or not owned by user",
      });
    }

    return response.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error: any) {
    return response.status(500).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};





export const interviewController = {
  createInterview,
  getAllInterviews,
  getInterviewById,
  deleteInterview,
};
