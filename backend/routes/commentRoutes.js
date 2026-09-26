const express = require("express");

const Comment = require("../models/Comment");
const Post = require("../models/Post");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ADD COMMENT
router.post(
    "/:postId",
    protect,
    async (req, res) => {

        try {

            const {
                text
            } = req.body;

            if (!text) {
                return res.status(400).json({
                    message: "Comment cannot be empty"
                });
            }

            const post =
                await Post.findById(
                    req.params.postId
                );

            if (!post) {
                return res.status(404).json({
                    message: "Post not found"
                });
            }

            const comment =
                await Comment.create({
                    post: req.params.postId,
                    user: req.user.id,
                    text
                });

            const populatedComment =
                await Comment.findById(
                    comment._id
                ).populate(
                    "user",
                    "name username"
                );

            res.status(201).json(
                populatedComment
            );

        } catch (error) {

            res.status(500).json({
                message: "Failed to add comment"
            });
        }
    }
);


// GET COMMENTS
router.get(
    "/:postId",
    async (req, res) => {

        try {

            const comments =
                await Comment.find({
                    post: req.params.postId
                })
                    .populate(
                        "user",
                        "name username"
                    )
                    .sort({
                        createdAt: -1
                    });

            res.json(comments);

        } catch (error) {

            res.status(500).json({
                message: "Failed to fetch comments"
            });
        }
    }
);

module.exports = router;