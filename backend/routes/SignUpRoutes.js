const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

            if (isPasswordMatch && existingUser.name === name) {
                const token = jwt.sign(
                    { userId: existingUser._id },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );

                res.cookie('token', token, {
                    httpOnly: true,
                    secure: false,
                    domain: 'localhost',
                    path: '/',
                    expires: new Date(Date.now() + 3600000),
                });

                return res.status(200).json({ message: "User already exists. Sign In successful. #1", token });
            }

            if (isPasswordMatch && existingUser.name !== name) {
                return res.status(400).json({ message: "Email already exists. #2" });
            }

            if (!isPasswordMatch) {
                return res.status(400).json({ message: "Email already exists, Forgot Password. #3" });
            }
        } else {
            const passwordMatchUser = await User.findOne({ name });
            if (passwordMatchUser && await bcrypt.compare(password, passwordMatchUser.password)) {
                return res.status(400).json({ message: "Please choose a stronger password. #4" });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Add the default image to the user object
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                image: '/user.png'  // Add the default profile image path
            });

            const savedUser = await newUser.save();

            const token = jwt.sign(
                { userId: savedUser._id },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: false,
                domain: 'localhost',
                path: '/',
                expires: new Date(Date.now() + 3600000),
            });

            return res.status(200).json({ message: "Sign In successful. #5", token, user: savedUser });
        }
    } catch (error) {
        console.error("Signup Error:", error.message);
        res.status(500).json({ message: "Error saving user", error });
    }
});


// POST /api/signupGoogle
router.post("/signup/google", async (req, res) => {
    try {
        const { name, email, password, image } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // Match name & image (optional match, or just email is enough)
            if (existingUser.name === name) {
                // ✅ User already exists & matches — treat as login
                const token = jwt.sign(
                    { userId: existingUser._id },
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );

                res.cookie("token", token, {
                    httpOnly: true,
                    secure: false,
                    domain: "localhost",
                    path: "/",
                    expires: new Date(Date.now() + 3600000) // 1 hour expiration
                });

                return res.status(200).json({
                    message: "Google login successful (existing user)",
                    user: existingUser,
                    token,
                });
            } else {
                return res
                    .status(400)
                    .json({ message: "Email already exists but name doesn't match" });
            }
        }

        // User doesn't exist, create new
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            image,
        });

        const savedUser = await newUser.save();

        const token = jwt.sign(
            { userId: savedUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            domain: "localhost",
            path: "/",
            expires: new Date(Date.now() + 3600000) // 1 hour expiration
        });

        res.status(201).json({
            message: "Google SignUp Successful",
            user: savedUser,
            token,
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});




module.exports = router;