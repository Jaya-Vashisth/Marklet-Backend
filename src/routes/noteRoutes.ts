import express from "express";
import { Request, Response } from "express";
import { createNote, deleteNote } from "../controllers/noteController.js";

const router = express.Router();

router.post("/create", (req: Request, res: Response) => {
  createNote(req, res);
});

router.delete("/delete/:id", (req: Request, res: Response) => {
  deleteNote(req, res);
});

export default router;
