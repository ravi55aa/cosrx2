const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();
const { generateToken } =  require("./jwt");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        // Create a JWT Token for 
        // pass it for the authorization purpose.
        //---------------------------------c
        const payload = { _id: profile.id ,email: profile.emails[0].value };

        const token = generateToken(payload); 

        const user = {
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value, // Get primary email
          photo: profile.photos[0].value, //this is an array of src thts why iam getting hte first value here
          token : token
        }

        return done(null, user);

      } catch (error) {
        return done(error, null);
      }
    }
  )
);
