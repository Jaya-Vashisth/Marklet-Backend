import express,{ Request,response,Response } from "express";



const app = express();

app.use(express.json());

//basic endpoint to test the server
app.get("/", (req: Request, res: Response) => { 
  
  res.status(200).json({ message: "Server running successfully!" });
  
});

app.listen(3000, async()=>{
    console.log(`Server is running on port 3000`);
});