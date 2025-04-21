import express from "express";
import { Request, Response } from "express";
import { uploadDocument } from "../controllers/documentController.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.post("/", upload.single("file"), (req: Request, res: Response) => {
  uploadDocument(req, res);
});

export default router;
