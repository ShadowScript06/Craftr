import { Request,Response } from "express"
import preparationServices from "./preparation.services";
import { success } from "zod";


const createSession=async(request:Request, response:Response)=>{
    try {
       const  userId= (request as any).user?.id;
        const data=request.body;

        const session=await preparationServices.createSession({...data,userId});

        
        response.status(201).json({
            success:true,
            data:session
        })
         
    } catch (error) {
        console.log(error);

        response.status(500).json({
            success:false,
            message:"Internal Server Error."
        })
    }
}


const getSessionById=async(request:Request, response:Response)=>{
    try {
       const  userId= (request as any).user?.id;

       const sessionId=(request.params.sessionId)as any;

       const session= await preparationServices.getSessionById(userId,sessionId);


       if(!session){
        response.status(404).json({
            success:false,
            message:"No session Found"
        })
       }
       response.status(200).json({
        success:true,
        data:session
       })
         
    } catch (error) {
        console.log(error);

        response.status(500).json({
            success:false,
            message:"Internal Server Error."
        })
    }
}
const getAllSession=async(request:Request, response:Response)=>{
    try {
       const  userId= (request as any).user?.id;

       const sessions=await preparationServices.getAllSession(userId);

       response.status(200).json({
        success:true,
        data:sessions
       })
         
    } catch (error) {
        console.log(error);

        response.status(500).json({
            success:false,
            message:"Internal Server Error."
        })
    }
}
const deleteSession=async(request:Request, response:Response)=>{
    try {
       const  userId= (request as any).user?.id;
        const sessionId=(request.params.sessionId)as any;

         const deletedSession=await preparationServices.deleteSession(userId,sessionId);

         if(!deleteSession){
            return response.status(404).json({
                success:false,
                message:"No session Found."
            });
         }

       response.status(200).json({
        success:true,
        data:deletedSession
       })
         
    } catch (error) {
        console.log(error);

        response.status(500).json({
            success:false,
            message:"Internal Server Error."
        })
    }
}

const generateMoreQuestions=async(request:Request,response:Response)=>{

    try {
        const  userId= (request as any).user?.id;
        const sessionId=(request.params.sessionId)as any;

        const session=await preparationServices.generateMoreQuestions(userId,sessionId);

        response.status(201).json({
            success:true,
            data:session
        })
    } catch (error) {
        console.log(error);
        response.status(500).json({
            success:false,
            message:"Internal Server Error."
        })
    }
    

        
}
const preparationController={
    createSession,
    getSessionById,
    getAllSession,
    deleteSession,
    generateMoreQuestions
}




export default preparationController;