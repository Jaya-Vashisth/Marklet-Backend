import { Request,Response } from "express";
import prisma from "../prisma.js";

export const getAllContent = async (req: Request, res: Response) => {
      

      if(req.isAuthenticated())
        {
            try{

                const userId = req.query.userId as string;
            
                // Check if userId is provided in the query parameters
                if(!userId) {
                    return res.status(400).json({ message: "User ID is required" });
                }
                
                // Fetch all content for the authenticated user
                const content = await prisma.content.findMany({where:{userId:userId},
                orderBy:[{createdAt:"desc"}],
                select:{
                    id:true,
                    type:true,
                    title:true,
                    content:true,
                    url:true,
                    metadata:true,
                    createdAt:true,}
                });

                console.log("Fetched content:", content);
                return res.status(200).json(content);
            }
            catch(err){
                console.log("error fething content", err);
                return res.status(500).json({error:"Error fetching content"});
            }
           }else{
                return res.status(401).json({message:"Unauthorized"});
            }
}

