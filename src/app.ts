import express, { Request, Response } from "express";
// import { rateLimiter } from "./middlewares/rateLimiter.js";
// import { securityMiddleware } from "./middlewares/security.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import documentRoutes from "./routes/documentRoute.js";
import searchRoutes from "./routes/searchRoutes.js";
import linkRoutes from "./routes/linkRoutes.js";
import sessionConfig from "./config/session.config.js";
import passport from "./config/passport.config.js";
import prisma from "./prisma.js";
import cors from "cors";

dotenv.config();

const port = parseInt(process.env.PORT || "3000", 10);

const app = express();

const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:5173"];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by Cors"));
            }
        },

        credentials: true,
    }),
);

//parse incoming json requests
app.use(express.json());

// app.set("trust proxy", 1);

//configure session
app.use(sessionConfig);

//initialize passport authentication
app.use(passport.initialize());
app.use(passport.session());

//middlewares
// app.use(rateLimiter);
// app.use(securityMiddleware);
app.use(errorHandler);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/note", noteRoutes);
app.use("/api/v1/link", linkRoutes);
app.use("/api/v1/documents", documentRoutes);
app.use("/api/v1/search", searchRoutes);

//basic endpoint to test the server
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Server running successfully!" });
});

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);

    try {
        await prisma.$connect();
        console.log("Connected to database successfully");
    } catch (err) {
        console.log("Error connecting to database", err);
    }
});

export default app;
