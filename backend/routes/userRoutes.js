const express = require("express");

const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();


// GET PROFILE
router.get("/:username", async (req, res) => {

    try {

        const user = await User.findOne({
            username: req.params.username
        }).select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {

        res.status(500).json({
            message: "Server error"
        });
    }
});


// FOLLOW / UNFOLLOW
router.post(
    "/:id/follow",
    protect,
    async (req, res) => {

        try {

            const currentUser =
                await User.findById(req.user.id);

            const targetUser =
                await User.findById(req.params.id);

            if (!targetUser) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            if (
                currentUser._id.toString() ===
                targetUser._id.toString()
            ) {
                return res.status(400).json({
                    message: "You cannot follow yourself"
                });
            }

            const alreadyFollowing =
                currentUser.following.includes(
                    targetUser._id
                );

            if (alreadyFollowing) {

                currentUser.following =
                    currentUser.following.filter(
                        id =>
                            id.toString() !==
                            targetUser._id.toString()
                    );

                targetUser.followers =
                    targetUser.followers.filter(
                        id =>
                            id.toString() !==
                            currentUser._id.toString()
                    );

                await currentUser.save();
                await targetUser.save();

                return res.json({
                    message: "Unfollowed successfully"
                });
            }

            currentUser.following.push(
                targetUser._id
            );

            targetUser.followers.push(
                currentUser._id
            );

            await currentUser.save();
            await targetUser.save();

            res.json({
                message: "Followed successfully"
            });

        } catch (error) {

            res.status(500).json({
                message: "Server error"
            });
        }
    }
);

module.exports = router;