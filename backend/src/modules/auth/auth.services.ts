import { response } from "express";
import { prisma } from "../../prisma/client";


async function syncUser(clerkId:string) {
  if (!clerkId) {
    throw new Error("clerkId are required");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      clerkId,
    },
  });

  if (existingUser) {
    return existingUser;
  }

  const user = await prisma.user.create({
    data: {
      clerkId
    },
  });


  
  await prisma.subscription.create({
    data:{
        userId:user.id,
        credits:100,
    }
  })


  return user;
}

export const authServices={syncUser};


