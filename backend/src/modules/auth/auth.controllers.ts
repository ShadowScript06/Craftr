import { getAuth } from "@clerk/express";
import { Request, Response } from "express";
import { authServices } from "./auth.services";

async function syncUser(request: Request, response: Response) {
  try {
    const auth = getAuth(request);

    const clerkId = auth.userId;

    if (!clerkId) {
      return response.status(409).json({
        message: "unauthorized",
      });
    }
    const user = await authServices.syncUser(clerkId);

    response.status(200).json({
      message: "user insync",
    });

    response.json();
  } catch (error) {
    console.log(error);
    response.status(500).json({
      messaage: "Internal  Server Error.",
    });
  }
}

export const authController = { syncUser };
