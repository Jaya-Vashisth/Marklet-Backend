import express, { response } from "express";
import { Request, Response } from "express";
import { searchByTitle, searchWithAI } from "../controllers/searhController.js";
const router = express.Router();

router.post("/ai", (req: Request, res: Response) => {
  searchWithAI(req, res);
});
router.post("/title", (req: Request, res: Response) => {
  searchByTitle(req, res);
});

export default router;
