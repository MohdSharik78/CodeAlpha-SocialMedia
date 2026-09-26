const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const authMiddleware = require("../middleware/authMiddleware");

// CREATE POST
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { content, image } = req.body;

        if (!content) {
            return res.status(400).json({
                message: "Post content is required"
            });
        }

        const post = await Post.create({
            user: req.user.id,
            content,
            image: image || ""
        });

        const populatedPost = await Post.findById(post._id)
            .populate("user", "name username");

        res.status(201).json(populatedPost);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error while creating post"
        });
    }
});


// GET ALL POSTS
router.get("/", async (req, res) => {
    try {

        const posts = await Post.find()
            .populate("user", "name username")
            .sort({ createdAt: -1 });

        res.json(posts);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error while fetching posts"
        });
    }
});


// GET SINGLE POST
router.get("/:id", async (req, res) => {
    try {

        const post = await Post.findById(req.params.id)
            .populate("user", "name username");

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        res.json(post);

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });
    }
});


// LIKE / UNLIKE POST
router.put("/:id/like", authMiddleware, async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                message: "Post not found"
            });
        }

        const userId = req.user.id.toString();

        const alreadyLiked = post.likes.some(
            id => id.toString() === userId
        );

        if (alreadyLiked) {

            post.likes = post.likes.filter(
                id => id.toString() !== userId
            );

        } else {

            post.likes.push(req.user.id);

        }

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate("user", "name username");

        res.json(updatedPost);

    } catch (error) {

        console.error("LIKE ERROR:", error);

        res.status(500).json({
            message: "Server error while liking post"
        });
    }
});


module.exports = router;