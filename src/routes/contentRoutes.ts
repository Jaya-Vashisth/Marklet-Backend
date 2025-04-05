import { Router } from "express";
import { getAllContent } from "../controllers/contentController.js";
import { Request, Response } from "express";

const router:Router = Router();


router.get("/", (req: Request, res: Response) => {
    getAllContent(req, res);
  });


export default router;