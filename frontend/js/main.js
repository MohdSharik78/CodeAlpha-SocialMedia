checkLogin();

const postsContainer = document.getElementById("postsContainer");

async function loadPosts() {

    if (!postsContainer) return;

    postsContainer.innerHTML =
        `<div class="loading">Loading posts...</div>`;

    try {

        const response = await fetch(`${API_URL}/posts`);

        const posts = await response.json();

        if (!response.ok) {
            throw new Error("Unable to load posts");
        }

        if (posts.length === 0) {

            postsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No posts yet</h3>
                    <p>Be the first person to create a post.</p>
                </div>
            `;

            return;
        }

        postsContainer.innerHTML = "";

        posts.forEach(post => {
            postsContainer.innerHTML += createPostHTML(post);
        });

        addPostEvents();

    } catch (error) {

        postsContainer.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load posts</h3>
                <p>Please make sure the backend server is running.</p>
            </div>
        `;
    }
}

function createPostHTML(post) {

    const currentUser = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    const currentUserId = currentUser._id;

    const isLiked =
        post.likes &&
        post.likes.some(id => {
            const value =
                typeof id === "object" ? id._id : id;

            return value === currentUserId;
        });

    const name = post.user?.name || "User";
    const username = post.user?.username || "user";

    const initial =
        name.charAt(0).toUpperCase();

    return `
        <article class="post-card" data-post-id="${post._id}">

            <div class="post-header">

                <div class="avatar">
                    ${initial}
                </div>

                <div>
                    <div class="post-user">
                        ${escapeHTML(name)}
                    </div>

                    <div class="post-username">
                        @${escapeHTML(username)}
                    </div>
                </div>

            </div>

            <div class="post-content">
                ${escapeHTML(post.content)}
            </div>

            ${post.image
            ? `<img
                    src="${escapeAttribute(post.image)}"
                    class="post-image"
                    alt="Post image"
                    onerror="this.style.display='none'"
                   >`
            : ""
        }

            <div class="post-actions">

                <button
                    class="action-btn like-btn ${isLiked ? "liked" : ""}"
                    data-id="${post._id}"
                >
                    ${isLiked ? "❤️" : "🤍"}
                    ${post.likes?.length || 0} Likes
                </button>

                <button
                    class="action-btn comment-toggle"
                    data-id="${post._id}"
                >
                    💬 Comments
                </button>

            </div>

            <div
                class="comments-section"
                id="comments-${post._id}"
                style="display:none;"
            >

                <div class="comment-form">

                    <input
                        type="text"
                        class="comment-input"
                        placeholder="Write a comment..."
                    >

                    <button
                        class="comment-submit"
                        data-id="${post._id}"
                    >
                        Send
                    </button>

                </div>

                <div class="comment-list">
                    Loading comments...
                </div>

            </div>

        </article>
    `;
}

function addPostEvents() {

    document.querySelectorAll(".like-btn")
        .forEach(button => {

            button.addEventListener("click", async () => {

                const postId = button.dataset.id;

                await likePost(postId);
            });
        });

    document.querySelectorAll(".comment-toggle")
        .forEach(button => {

            button.addEventListener("click", async () => {

                const postId = button.dataset.id;

                const section =
                    document.getElementById(`comments-${postId}`);

                if (section.style.display === "none") {

                    section.style.display = "block";

                    await loadComments(postId, section);

                } else {

                    section.style.display = "none";
                }
            });
        });

    document.querySelectorAll(".comment-submit")
        .forEach(button => {

            button.addEventListener("click", async () => {

                const postId = button.dataset.id;

                const article =
                    document.querySelector(
                        `[data-post-id="${postId}"]`
                    );

                const input =
                    article.querySelector(".comment-input");

                const text = input.value.trim();

                if (!text) return;

                await addComment(postId, text);

                input.value = "";

                const section =
                    document.getElementById(`comments-${postId}`);

                await loadComments(postId, section);
            });
        });
}

async function likePost(postId) {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `${API_URL}/posts/${postId}/like`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        await loadPosts();

    } catch (error) {

        alert(error.message || "Unable to like post");
    }
}

async function loadComments(postId, section) {

    const list =
        section.querySelector(".comment-list");

    list.innerHTML = "Loading comments...";

    try {

        const response = await fetch(
            `${API_URL}/comments/${postId}`
        );

        const comments = await response.json();

        if (!response.ok) {
            throw new Error("Unable to load comments");
        }

        if (comments.length === 0) {

            list.innerHTML =
                "<p>No comments yet.</p>";

            return;
        }

        list.innerHTML = comments.map(comment => {

            return `
                <div class="comment-item">

                    <div class="comment-author">
                        ${escapeHTML(comment.user?.name || "User")}
                    </div>

                    <div class="comment-text">
                        ${escapeHTML(comment.text)}
                    </div>

                </div>
            `;

        }).join("");

    } catch (error) {

        list.innerHTML =
            "<p>Unable to load comments.</p>";
    }
}

async function addComment(postId, text) {

    const token = localStorage.getItem("token");

    try {

        const response = await fetch(
            `${API_URL}/comments/${postId}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify({
                    text
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

    } catch (error) {

        alert(error.message || "Unable to add comment");
    }
}

/* Security helper */

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value || "";

    return div.innerHTML;
}

function escapeAttribute(value) {

    return String(value || "")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

loadPosts();