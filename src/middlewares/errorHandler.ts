import { Request,Response, NextFunction } from "express";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack); // Log the error stack trace for debugging
    res.status(500).json({ message: "Internal Server Error", error: err.message });
}