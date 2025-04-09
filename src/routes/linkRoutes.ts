import express from "express";
import { Request, Response } from "express";

import { createLink } from "../controllers/linkController.js";

const router = express.Router();

router.post("/", (req: Request, res: Response) => {
  createLink(req, res);
});

export default router;
