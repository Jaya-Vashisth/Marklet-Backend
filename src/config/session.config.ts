import session from 'express-session';

const sessionConfig = session({
   
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production" && process.env.USE_HTTPS ==='true',
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        },      
    
});


export default sessionConfig;