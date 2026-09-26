checkLogin();

const postForm =
    document.getElementById("postForm");

if (postForm) {

    postForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const content =
            document.getElementById("content")
                .value.trim();

        const image =
            document.getElementById("image")
                .value.trim();

        const message =
            document.getElementById("postMessage");

        if (!content) {

            message.textContent =
                "Please write something.";

            message.style.color = "#dc2626";

            return;
        }

        const token =
            localStorage.getItem("token");

        try {

            const response = await fetch(
                `${API_URL}/posts`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        content,
                        image
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to create post"
                );
            }

            message.textContent =
                "Post published successfully!";

            message.style.color = "#16a34a";

            postForm.reset();

            setTimeout(() => {

                window.location.href = "index.html";

            }, 800);

        } catch (error) {

            message.textContent =
                error.message;

            message.style.color = "#dc2626";
        }
    });
}