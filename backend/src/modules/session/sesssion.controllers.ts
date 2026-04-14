import { Request, Response } from "express";
import { sessionServices } from "./session.services";



interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

 const startSession = async (request: Request, response: Response) => {
  try {
    const { interviewId } = request.params as any;
    const userId = (request as any).user.id;
    const {difficulty}=request.body;

    const result = await sessionServices.startSession({
      interviewId,
      userId,
      difficulty
    });

    return response.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.log(error);
    return response.status(500).json({
      success: false,
      message: error.message || "Failed to start session",
    });
  }
};


const endSession =async( request: AuthenticatedRequest,
  response: Response
)=>{
try {
    const { interviewId, sessionId } = request.params as any;

    const userId = request.user?.id;

    // 🔒 Safety checks
    if (!userId) {
      return response.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!interviewId || !sessionId) {
      return response.status(400).json({
        success: false,
        message: "Missing required params",
      });
    }

    // 🚀 Call service
    const result = await sessionServices.endSession({
      interviewId,
      sessionId,
      userId,
    });

    // ✅ Success response
    return response.status(200).json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error("END SESSION ERROR:", error.message);

    return response.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}









export const retrySession= async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { interviewId } = req.params as any;
    const userId = req.user?.id;

    // 🔒 Auth check
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 🔒 Param validation
    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: "Interview ID is required",
      });
    }

    // 🚀 Call service
    const result = await sessionServices.retrySession({
      interviewId,
      userId,
    });

    // ✅ Success response
    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error("RETRY SESSION ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};





export const getSessions = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { interviewId } = req.params as any;
    const userId = req.user?.id;

    // 🔒 Auth check
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // 🔒 Param check
    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: "Interview ID is required",
      });
    }

    // 🚀 Call service
    const sessions = await sessionServices.getSessionsByInterview({
      interviewId,
      userId,
    });

    // ✅ Response
    return res.status(200).json({
      success: true,
      data: sessions,
    });

  } catch (error: any) {
    console.error("GET SESSIONS ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
};




export const getSessionById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { interviewId, sessionId } = req.params as any;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!interviewId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Missing params",
      });
    }

    const session = await sessionServices.getSessionById({
      interviewId,
      sessionId,
      userId,
    });

    return res.status(200).json({
      success: true,
      data: session,
    });

  } catch (error: any) {
    console.error("GET SESSION ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};





export const deleteSession = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { interviewId, sessionId } = req.params as any;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!interviewId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Missing params",
      });
    }

    const result = await sessionServices.deleteSession({
      interviewId,
      sessionId,
      userId,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error("DELETE SESSION ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};






const submitAnswer = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { sessionId, questionId } = req.params as any;
    const { answer } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!answer) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    const result = await sessionServices.submitAnswer({
      sessionId,
      questionId,
      userId,
      answer,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error("SUBMIT ANSWER ERROR:", error.message);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getSessionResult=async(req: AuthenticatedRequest,
  res: Response)=>{
    
}

// export const runCode = async (req: any, res: Response) => {
//   try {
//     const { interviewId, sessionId ,questionId} = req.params as any;
//     const {  code, language } = req.body;
//     const userId = (req as any).user?.id;

    
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Unauthorized" });
//     }

//     const result = await sessionServices.runCode({
//       interviewId,
//       sessionId,
//       questionId,
//       userId,
//       code,
//       language,
//     });

//     return res.status(200).json({
//       success: true,
//       data: result,
//     });

//   } catch (error: any) {
//     console.log(error);
//     console.error("RUN CODE ERROR:", error.message);

//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };



export const sessioncontroller={startSession,endSession,retrySession,getSessions,getSessionById,deleteSession,submitAnswer,getSessionResult}