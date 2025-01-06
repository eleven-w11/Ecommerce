const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

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

                // console.log("Generated JWT Token:", token);
                return res.status(200).json({ message: "User already exists. Sign In successful. #1", token });
            }

            if (isPasswordMatch && existingUser.name !== name) {
                return res.status(400).json({ message: "Email already exists. #2" });
            }

            if (!isPasswordMatch) {
                return res.status(400).json({ message: "Email already exists, Forgrt Password. #3" });
            }
        } else {
            const passwordMatchUser = await User.findOne({ name });
            if (passwordMatchUser && await bcrypt.compare(password, passwordMatchUser.password)) {
                return res.status(400).json({ message: "Please choose a stronger password. #4" });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newUser = new User({
                name,
                email,
                password: hashedPassword
            });

            // console.log("Received Name, Email in logRoutes.js:", name, email, password);

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

            // console.log("Generated JWT Token:", token);
            return res.status(200, 201).json({ message: "Sign In successful. #5", token, user: savedUser });
        }
    } catch (error) {
        console.error("Signup Error:", error.message);
        // console.error("Error in logRoutes.js while saving user:", error);
        res.status(500).json({ message: "Error saving user", error });
    }
});

module.exports = router;