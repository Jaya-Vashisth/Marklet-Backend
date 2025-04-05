import passport from 'passport';
import { Strategy as Googlestrategy } from 'passport-google-oauth20'; 
import prisma from '../prisma.js';



passport.serializeUser((user:any, done) => { 
    done(null, user.id);
    });

passport.deserializeUser(async (id:string, done) => {
    try {
          const user = await prisma.user.findUnique({
            where: { id },  
            });

            console.log("User found in deserialize",user);
            done(null, user);       
    } catch (error) {
        done(error, null);
    }
}
);

passport.use(new Googlestrategy({
    clientID: process.env.GOOGLE_CLIENT_ID|| "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET|| "",
    callbackURL: 'http://localhost:3000/api/v1/auth/google/callback',
    passReqToCallback: true,
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
        let user = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails?.[0].value || "",
              avatar: profile.photos?.[0].value || "",
            },
          });
        }

        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

export default passport;