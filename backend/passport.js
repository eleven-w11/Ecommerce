// X:\react-Web\ecommerce\backend\passport.js
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            // callbackURL: "/api/auth/google/callback", for localhost
            callbackURL: `${process.env.REACT_APP_API_BASE_URL}/api/auth/google/callback`,
        },
        function (accessToken, refreshToken, profile, done) {
            // You can save profile info to DB here
            return done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
