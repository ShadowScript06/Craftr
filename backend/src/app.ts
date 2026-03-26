import express from "express";
import cors from "cors";
const dotenv=require('dotenv');


import {clerkMiddleware , requireAuth} from "@clerk/express";


dotenv.config();

export const app=express();


app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());


app.get("/health", (req, res) => {
  res.send("API running");
});
