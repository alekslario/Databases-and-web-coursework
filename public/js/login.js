document.addEventListener("DOMContentLoaded", () => {
  const formTitle = document.getElementById("form-title");
  const formButton = document.getElementById("formButton");
  const newUserToggle = document.getElementById("newUserToggle");
  const loginForm = document.getElementById("loginForm");
  // get div with class status
  const statusDiv = document.querySelector(".status");

  // Update form title and button based on the toggle
  newUserToggle.addEventListener("change", () => {
    if (newUserToggle.checked) {
      formTitle.textContent = "Register";
      formButton.textContent = "Register";
    } else {
      formTitle.textContent = "Login";
      formButton.textContent = "Login";
    }
  });

  // Handle form submission manually
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission
    statusDiv.style.visibility = "hidden"; // Hide status message
    const formData = new FormData(loginForm);
    const url = newUserToggle.checked ? "/register" : "/login"; // Decide endpoint based on toggle

    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries())),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok) {
        // redirect to previous url
        console.log("document.referrer", document.referrer);
        if (document.referrer.includes("/login")) {
          window.location.href = "/";
        } else {
          window.location.href = document.referrer || "/";
        }
      } else {
        // update status message /  div -> get div with class status
        statusDiv.textContent = result.error;
        // set visibility
        statusDiv.style.visibility = "visible";
      }
    } catch (error) {
      // update status message /  div -> get div with class status
      console.log("error", error);
      statusDiv.textContent = "Error";
      // set visibility
      statusDiv.style.visibility = "visible";
    }
  });
});
