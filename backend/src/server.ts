import {app} from "./app";
import { startJobsScheduler } from "./utils/schedular/jobSchedular";

const dotenv=require('dotenv');
dotenv.config();


const PORT=process.env.PORT || 5000;

app.listen(PORT, async()=>{
     startJobsScheduler();
    console.log("App is running on port "+ PORT);
})