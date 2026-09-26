checkLogin();

const profileContainer =
    document.getElementById("profileContainer");

const profilePosts =
    document.getElementById("profilePosts");

async function loadProfile() {

    const currentUser =
        JSON.parse(localStorage.getItem("user") || "{}");

    const username =
        new URLSearchParams(window.location.search)
            .get("username") || currentUser.username;

    if (!username) {

        profileContainer.innerHTML = `
            <div class="empty-state">
                Profile not found.
            </div>
        `;

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/users/profile/${username}`
        );

        const user = await response.json();

        if (!response.ok) {
            throw new Error(user.message || "Profile not found");
        }

        displayProfile(user);

        loadUserPosts(user._id);

    } catch (error) {

        profileContainer.innerHTML = `
            <div class="empty-state">
                <h3>Profile not found</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function displayProfile(user) {

    const currentUser =
        JSON.parse(localStorage.getItem("user") || "{}");

    const isOwnProfile =
        currentUser._id === user._id;

    const isFollowing =
        currentUser.following &&
        currentUser.following.some(id => {

            const value =
                typeof id === "object" ? id._id : id;

            return value === user._id;
        });

    const initial =
        (user.name || "U").charAt(0).toUpperCase();

    profileContainer.innerHTML = `

        <div class="profile-header">

            <div class="profile-avatar">
                ${initial}
            </div>

            <div class="profile-info">

                <h1>
                    ${escapeHTML(user.name)}
                </h1>

                <div class="username">
                    @${escapeHTML(user.username)}
                </div>

                <p class="profile-bio">
                    ${escapeHTML(
        user.bio || "No bio added yet."
    )}
                </p>

            </div>

            ${!isOwnProfile
            ? `
                    <button
                        class="primary-btn follow-btn"
                        id="followBtn"
                        data-user-id="${user._id}"
                    >
                        ${isFollowing ? "Unfollow" : "Follow"}
                    </button>
                `
            : ""
        }

        </div>

        <div class="profile-stats">

            <div class="stat">
                <strong>
                    ${user.followers?.length || 0}
                </strong>
                <span>Followers</span>
            </div>

            <div class="stat">
                <strong>
                    ${user.following?.length || 0}
                </strong>
                <span>Following</span>
            </div>

        </div>
    `;

    const followBtn =
        document.getElementById("followBtn");

    if (followBtn) {

        followBtn.addEventListener(
            "click",
            async () => {

                await followUser(user._id);
            }
        );
    }
}

async function followUser(userId) {

    const token =
        localStorage.getItem("token");

    try {

        const response = await fetch(
            `${API_URL}/users/${userId}/follow`,
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

        /*
         * Refresh stored user data
         */
        const currentUser =
            JSON.parse(localStorage.getItem("user") || "{}");

        if (!currentUser.following) {
            currentUser.following = [];
        }

        if (data.following) {
            currentUser.following = data.following;
        }

        localStorage.setItem(
            "user",
            JSON.stringify(currentUser)
        );

        loadProfile();

    } catch (error) {

        alert(error.message || "Unable to follow user");
    }
}

async function loadUserPosts(userId) {

    profilePosts.innerHTML =
        `<div class="loading">Loading posts...</div>`;

    try {

        const response =
            await fetch(`${API_URL}/posts`);

        const posts =
            await response.json();

        const userPosts =
            posts.filter(post => {

                const postUserId =
                    post.user?._id || post.user;

                return postUserId === userId;
            });

        if (userPosts.length === 0) {

            profilePosts.innerHTML = `
                <div class="empty-state">
                    <h3>No posts yet</h3>
                    <p>This user hasn't created any posts.</p>
                </div>
            `;

            return;
        }

        profilePosts.innerHTML =
            userPosts.map(post => {

                return `
                    <article class="post-card">

                        <div class="post-header">

                            <div class="avatar">
                                ${(post.user?.name || "U")
                        .charAt(0)
                        .toUpperCase()}
                            </div>

                            <div>
                                <div class="post-user">
                                    ${escapeHTML(
                            post.user?.name || "User"
                        )}
                                </div>

                                <div class="post-username">
                                    @${escapeHTML(
                            post.user?.username || "user"
                        )}
                                </div>
                            </div>

                        </div>

                        <div class="post-content">
                            ${escapeHTML(post.content)}
                        </div>

                        ${post.image
                        ? `
                                <img
                                    src="${escapeAttribute(post.image)}"
                                    class="post-image"
                                    alt="Post image"
                                >
                              `
                        : ""
                    }

                        <div class="post-actions">

                            <span class="action-btn">
                                ❤️ ${post.likes?.length || 0} Likes
                            </span>

                        </div>

                    </article>
                `;

            }).join("");

    } catch (error) {

        profilePosts.innerHTML = `
            <div class="empty-state">
                Unable to load posts.
            </div>
        `;
    }
}

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

loadProfile();