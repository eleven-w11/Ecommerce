// routes/googleAuthRoutes.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/StoreUser');

/* ------------------------------------------------------------------ */
/* 0.  Sanity‑check critical env vars                                 */
/* ------------------------------------------------------------------ */
['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL', 'JWT_SECRET', 'FRONTEND_URL']
    .forEach((key) => {
        if (!process.env[key]) {
            console.error(`❌  Missing required env var: ${key}`);
            process.exit(1);
        }
    });

const FRONTEND_URL = process.env.FRONTEND_URL;            // e.g. https://your-web-gamma.vercel.app
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;     // e.g. https://yourweb-backend.onrender.com/auth/google/callback
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/* ------------------------------------------------------------------ */
/* 1.  Passport Google strategy                                       */
/* ------------------------------------------------------------------ */
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: CALLBACK_URL,
            passReqToCallback: false,      // we don’t need req inside verify fn
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                if (!profile.emails?.[0]?.value) {
                    return done(new Error('No email returned by Google'), null);
                }

                const email = profile.emails[0].value;
                let user = await User.findOne({ $or: [{ email }, { googleId: profile.id }] });

                if (!user) {
                    user = await User.create({
                        name: profile.displayName || 'Google User',
                        email,
                        googleId: profile.id,
                        image: profile.photos?.[0]?.value || '/user.png',
                        password: '',                      // local password empty
                    });
                }

                return done(null, user);
            } catch (err) {
                console.error('🔴  Google strategy error:', err);
                return done(err, null);
            }
        }
    )
);

/* ------------------------------------------------------------------ */
/* 2.  /auth/google  – Kick‑off route                                 */
/* ------------------------------------------------------------------ */
router.get(
    '/',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        prompt: 'select_account',
    })
);

/* ------------------------------------------------------------------ */
/* 3.  /auth/google/callback                                          */
/* ------------------------------------------------------------------ */
router.get('/callback', (req, res, next) => {
    passport.authenticate(
        'google',
        {
            failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`,
            session: false,
        },
        (err, user) => {
            if (err) {
                console.error('🔴  Auth callback error:', err);
                return res.redirect(`${FRONTEND_URL}/login?error=server_error`);
            }

            if (!user) {
                return res.redirect(`${FRONTEND_URL}/login?error=no_user`);
            }

            // ✅  Successful login → issue JWT & set cookie
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            res.cookie('token', token, {
                httpOnly: true,
                secure: IS_PRODUCTION,
                sameSite: IS_PRODUCTION ? 'none' : 'lax',
                maxAge: 60 * 60 * 1000,   // 1 hour
            });

            return res.redirect(`${FRONTEND_URL}/UserProfilePage`);
        }
    )(req, res, next);
});

module.exports = router;
