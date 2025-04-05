import { Router } from "express";
import passport from "../config/passport.config.js"
import prisma from "../prisma.js"



const router = Router();

router.get('/', (req, res) => {
    console.log("Auth route hit")
    res.send('<a href="/api/v1/auth/google">Login with Google</a>');    
}
);
//route to authenticate user using google strategy
router.get("/google", passport.authenticate("google", {scope:["profile","email"]}));



//route to handle the callback from google after authentication
router.get("/google/callback",passport.authenticate("google",{failureRedirect:"/"}),async (req,res)=>{ console.log("logged in"); res.redirect(process.env.CLIENT_URL||"http://localhost:3000")});




//route to handle the logout request
router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            console.log(err);
            return res.status(500).json({message:"Logout failed"});
        }
        console.log("Logged out successfully");
        res.send("Logged out successfully");
    })
});


//route to check if the user is authenticated or not
router.get("/user", (req,res)=>{

    console.log(req.session);
    console.log(req.user);

   try{
    if(req.isAuthenticated()){
        console.log(req.user)
        res.status(200).json({success:true, message:"User authenticated", user:req.user}) 
    }
    else{
        res.status(401).json({success:false, message:"Unauthorized"});
    }
}catch(err){        
    console.log(err);
    res.status(500).json({success:false, message:"Internal server error"});
}
});


// router.get("/demo", async (req, res) => {
//     try {
//       const demoUser = await prisma.user.findUnique({
//         where: { email: "demo@gmail.com" },
//       });
  
//       if (!demoUser) {
//         return res.status(404).json({ message: "Demo account not found" });
//       }
  
//       req.login(demoUser, (err) => {
//         if (err) {
//           return res
//             .status(500)
//             .json({ message: "Error logging in demo user", error: err });
//         }
//         res.redirect(process.env.CLIENT_URL + "/dashboard");
//       });
//     } catch (error) {
//       res.status(500).json({ message: "Error logging in demo user", error });
//     }
//   });
  






export default router;