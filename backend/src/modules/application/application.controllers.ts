import { applicationServices } from "./application.services";
import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/attachUser";

const createApplication = async (request: AuthRequest, response: Response) => {
  try {
   
    const userId = (request as any).user?.id;
    if (!userId)
      return response.status(403).json({
        success: false,
        message: "Invalid input",
      });

    // ✅ extract only allowed fields (avoid blindly spreading)
    const { company, role, link, source, status, salary, location } =
      request.body;

    const application = await applicationServices.createApplication(
      {
        company,
        role,
        link,
        source,
        status,
        salary,
        location,
      },
      userId,
    );

    return response.status(201).json({
      success: true,
      data: application,
      message: "Application Created Succesfully.",
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      message: "Internal Server Error.",
    });
  }
};

const getAllApplications = async (request: Request, response: Response) => {
  try {
    const userId = (request as any).user?.id;

    const applications = await applicationServices.getAllApplications(userId);

    if (applications.length <= 0) {
      return response.status(404).json({
        success: false,
        message: "No record found.",
      });
    }

    return response.status(200).json({
      success: true,
      data: applications,
      message: "Application fetched Succesfully.",
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      message: "Internal Server Error.",
    });
  }
};

const getApplicationById = async (request: Request, response: Response) => {
  try {
    const userId = (request as any).user?.id;

    const applicationId = request.params.id;

    if (!applicationId)
      return response.status(403).json({
        success: false,
        message: "Invalid Input",
      });


    const application = await applicationServices.getApplicationById(
      //@ts-ignore
      applicationId,
      userId,
    );

    if (!application) {
      return response.status(404).json({
        success: false,
        message: "Record not Found",
      });
    }

    return response.status(200).json({
      success: true,
      data: application,
      message: "Application Fetched Succesfully",
    });
  } catch (error) {
    console.log(error);
    response.status(500).json({
      message: "Internal Server Error.",
    });
  }
};

const updateApplication = async (request: Request, response: Response) => {
  try {
    const userId = (request as any).user?.id;
    const { applicationId } = request.params;

    // ✅ extract only allowed fields (partial update)
    const { company, role, link, source, status, location, salary } =
      request.body;

    const updatedApplication = await applicationServices.updateApplication(
      //@ts-ignore
      applicationId,
      userId,
      {
        company,
        role,
        link,
        source,
        status,
        location,
        salary,
      },
    );

    if (!updatedApplication) {
      return response.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    return response.json({
      success: true,
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Update Application Error:", error);

    return response.status(500).json({
      success: false,
      message: "Failed to update application",
    });
  }
};

const createNote = async (request: Request, response: Response) => {
  try {
    const userId = (request as any).user?.id;
    if (!userId)
      return response.status(403).json({
        success: false,
        message: "Invalid input",
      });
    const applicationId = request.params.applicationId;
    const { content } = request.body;

    // 🔐 ensure application belongs to user
    const application = await applicationServices.getApplicationById(
      //@ts-ignore
      applicationId,
      userId,
    );

    if (!application) {
      return response.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const note = await applicationServices.createNote({
      applicationId,
      content,
    });

    return response.status(201).json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error("Create Note Error:", error);

    return response.status(500).json({
      success: false,
      message: "Failed to create note",
    });
  }
};

const updateNote = async (request: Request, response: Response) => {
  try {
    const userId = (request as any).user?.id;
    if (!userId)
      return response.status(403).json({
        success: false,
        message: "Invalid input",
      });
    const { noteId } = request.params;
    const { content } = request.body;

    const updatedNote = await applicationServices.updateNote(
      //@ts-ignore
      noteId,
      userId,
      content,
    );

    if (!updatedNote) {
      return response.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return response.json({
      success: true,
      data: updatedNote,
    });
  } catch (error) {
    console.error("Update Note Error:", error);

    return response.status(500).json({
      success: false,
      message: "Failed to update note",
    });
  }
};

const deleteNote = async (request: Request, response: Response) => {
  try {
    const userId = (request as any).user?.id;
    const { noteId } = request.params;

    const deleted = await applicationServices.deleteNote(
      //@ts-ignore
      noteId,
      userId,
    );

    if (!deleted) {
      return response.status(404).json({
        success: false,
        message: "Note not found",
      });
    }

    return response.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete Note Error:", error);

    return response.status(500).json({
      success: false,
      message: "Failed to delete note",
    });
  }
};

const getAllNotes = async (request: Request, response: Response) => {
  try {
    const userId = (request as any).user?.id;
    const { applicationId } = request.params;

    // 🔐 ensure application belongs to user
    const application = await applicationServices.getApplicationById(
      //@ts-ignore
      applicationId,
      userId,
    );

    if (!application) {
      return response.status(404).json({
        success: false,
        message: "Application not found",
      });
    }
    //@ts-ignore
    const notes = await applicationServices.getAllNotes(applicationId);

    return response.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("Get Notes Error:", error);

    return response.status(500).json({
      success: false,
      message: "Failed to fetch notes",
    });
  }
};
export const applicationController = {
  createApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  createNote,
  updateNote,
  deleteNote,
  getAllNotes,
};
