const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();


// REGISTER
router.post("/register", async (req, res) => {

    try {

        const {
            name,
            username,
            email,
            password
        } = req.body;

        if (
            !name ||
            !username ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({
            $or: [
                { email },
                { username }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Username or email already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Registration successful",
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });
    }
});


// LOGIN
router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const validPassword =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username
            }
        });

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;