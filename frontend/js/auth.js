const API_URL = "http://localhost:5000/api";

// Check login
function checkLogin() {
    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
    }
}

// Logout
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}

// Logout button
document.addEventListener("DOMContentLoaded", () => {

    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    // Login form
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            const message = document.getElementById("loginMessage");

            try {

                const response = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Login failed");
                }

                localStorage.setItem("token", data.token);

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                message.textContent = "Login successful! Redirecting...";
                message.style.color = "#16a34a";

                setTimeout(() => {
                    window.location.href = "index.html";
                }, 700);

            } catch (error) {

                message.textContent = error.message;
                message.style.color = "#dc2626";
            }
        });
    }

    // Register form
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener("submit", async (e) => {

            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const username = document.getElementById("username").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            const message = document.getElementById("registerMessage");

            try {

                const response = await fetch(`${API_URL}/auth/register`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        username,
                        email,
                        password
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Registration failed");
                }

                message.textContent =
                    "Account created successfully! Redirecting...";

                message.style.color = "#16a34a";

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1000);

            } catch (error) {

                message.textContent = error.message;
                message.style.color = "#dc2626";
            }
        });
    }
});