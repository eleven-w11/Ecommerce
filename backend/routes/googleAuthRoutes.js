const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/StoreUser');

// Configure Passport with proper error handling
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google profile received:', profile);

        if (!profile.emails || !profile.emails[0]) {
            throw new Error('No email provided by Google');
        }

        const email = profile.emails[0].value;
        let user = await User.findOne({
            $or: [
                { email },
                { googleId: profile.id }
            ]
        });

        if (!user) {
            user = new User({
                name: profile.displayName || 'Google User',
                email,
                googleId: profile.id,
                image: profile.photos?.[0]?.value || '/user.png',
                password: '' // Empty password for Google users
            });
            await user.save();
        }

        return done(null, user);
    } catch (err) {
        console.error('Google strategy error:', err);
        return done(err, null);
    }
}));

// Auth routes with enhanced error handling
router.get('/', passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account'
}));

router.get('/callback', (req, res, next) => {
    passport.authenticate('google', {
        failureRedirect: '/login',
        session: false
    }, async (err, user, info) => {
        try {
            if (err) {
                console.error('Authentication error:', err);
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
            }

            if (!user) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
            }

            const token = jwt.sign(
                { userId: user._id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                maxAge: 3600000
            });

            return res.redirect(`${process.env.FRONTEND_URL}/UserProfilePage`);
        } catch (error) {
            console.error('Callback processing error:', error);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
        }
    })(req, res, next);
});

module.exports = router;
