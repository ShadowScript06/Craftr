import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";

export interface AuthRequest extends Request {
  user?: { id: string };
}

export async function attachUser(
  request: Request,
  response: Response,
  next: NextFunction,
) {
     const req = request as AuthRequest; 
  const auth = getAuth(request);

  const clerkId = auth.userId;

  if (!clerkId) {
    return response.status(401).json({
      message: "unauthorized",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      clerkId: clerkId,
    },
  });

  if (!user) {
    return response.status(409).json({
      message: "user does not exist",
    });
  }

  req.user = { id: user.id };

  next();
}
