import express,{ Request,response,Response } from "express";
import { link } from "node:fs";
import { createRequire } from "node:module";
import { errorHandler } from "./middlewares/errorHandler.js";
const require = createRequire(import.meta.url);
require("dotenv").config();
import authRoutes from "./routes/authRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import sessionConfig from "./config/session.config.js";
import passport from "passport";
import prisma from "./prisma.js";


const port = parseInt(process.env.PORT || "3000", 10);


const app = express();


//parse incoming json requests
app.use(express.json());


//configure session
app.use(sessionConfig);


//initialize passport authentication
app.use(passport.initialize());
app.use(passport.session());

//middlewares
app.use(errorHandler);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/content",contentRoutes);
app.use("/api/v1/note", noteRoutes);
// app.use("api/v1/document", documentRoutes);
// app.use("api/v1/search",searchRoutes);
// app.use("api/v1/link",linkRoutes);


//basic endpoint to test the server
app.get("/", (req: Request, res: Response) => { 
  
  res.status(200).json({ message: "Server running successfully!" });
  
});

app.listen(port, async()=>{
    console.log(`Server is running on port ${port}`);

    try{
        await prisma.$connect();
        console.log("Connected to database successfully");
    }
    catch(err){
        console.log("Error connecting to database",err);
    }
});