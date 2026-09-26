const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

const authRoutes =
    require("./routes/authRoutes");

const userRoutes =
    require("./routes/userRoutes");

const postRoutes =
    require("./routes/postRoutes");

const commentRoutes =
    require("./routes/commentRoutes");

dotenv.config();

connectDB();

const app = express();

app.use(cors());

app.use(express.json());


// ROUTES
app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/posts",
    postRoutes
);

app.use(
    "/api/comments",
    commentRoutes
);


// HOME
app.get("/", (req, res) => {

    res.json({
        message:
            "CodeAlpha Social Media API is running"
    });

});


const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    () => {
        console.log(
            `Server running on port ${PORT}`
        );
    }
);