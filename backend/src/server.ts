import { app } from "./app";
import { startJobsScheduler } from "./utils/schedular/jobSchedular";
import http from "http";
const dotenv = require("dotenv");
dotenv.config();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);



server.listen(PORT, async () => {

  startJobsScheduler();
  console.log("Server running on port " + PORT);
});
