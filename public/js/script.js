document.addEventListener("DOMContentLoaded", () => {
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const generateBtn = document.getElementById("generateBtn");
  const progressBar = document.getElementById("progressBar");
  const progressBarFill = progressBar.querySelector("div");
  const status = document.getElementById("status");

  const searchInput = document.getElementById("searchInput");
  const searchForm = document.getElementById("searchForm");

  let debounceTimer;

  const local = false;
  const baseUrl = local ? "/" : "https://www.doc.gold.ac.uk/usr/166";

  // Debounce the API call to wait until the user stops typing
  if (searchInput) {
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        triggerApiCall(searchInput.value);
      }, 1000); // Adjust debounce delay as needed
    });

    // Prevent form submission on Enter key press
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      triggerApiCall(searchInput.value);
    });
  }

  // Function to trigger the API call
  function triggerApiCall(query) {
    // accpeting empty query as well - defaults to all quizzes
    console.log("API call triggered with query:", query);

    fetch(`${baseUrl}/search?q=${encodeURIComponent(query)}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("API response:", data);
        const quizList = document.querySelector(".quiz-list");
        quizList.innerHTML = ""; // Clear existing quizzes

        // If no quizzes are found
        if (data.quizzes && data.quizzes.length === 0) {
          quizList.innerHTML = "<p>No quizzes found</p>";
        } else {
          data.quizzes.forEach((quiz) => {
            const quizItem = document.createElement("li");
            quizItem.classList.add("quiz-item");

            const quizTitleBtn = document.createElement("button");
            quizTitleBtn.classList.add("quiz-title-btn", "quiz-btn");
            quizTitleBtn.setAttribute("data-quiz-id", quiz.quiz_id);
            quizTitleBtn.textContent = quiz.title;

            const quizRatio = document.createElement("p");
            quizRatio.classList.add("quiz-ratio");
            quizRatio.textContent = `Ratio: ${quiz.correctAnswers} / ${quiz.questionCount}`;

            quizItem.appendChild(quizTitleBtn);
            quizItem.appendChild(quizRatio);
            quizList.appendChild(quizItem);
          });
          attachQuizListeners();
        }
      })
      .catch((error) => {
        // console.error("API error:", error);
      });
  }

  const recentQuizzesBtn = document.getElementById("recentQuizzesBtn");
  const quizModal = document.getElementById("quizModal");
  const closeModal = document.getElementById("closeModal");

  if (recentQuizzesBtn) {
    // Show the modal
    recentQuizzesBtn.addEventListener("click", () => {
      quizModal.classList.remove("hidden");
    });

    // Hide the modal
    closeModal.addEventListener("click", () => {
      quizModal.classList.add("hidden");
    });

    // Close modal when clicking outside content
    window.addEventListener("click", (e) => {
      if (e.target === quizModal) {
        quizModal.classList.add("hidden");
      }
    });
  }

  function attachQuizListeners() {
    const quizButtons = document.querySelectorAll(".quiz-btn");
    quizButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault(); // Prevent any default action
        const quizId = button.dataset.quizId; // Get quiz ID from data attribute
        console.log("Quiz ID:", quizId);

        try {
          const response = await fetch(`${baseUrl}/quiz/${quizId}`);

          if (!response.ok) {
            throw new Error("Failed to fetch quiz data");
          }

          const { quizTitle, questions } = await response.json();

          // Store quiz data in local storage
          localStorage.setItem("quizData", JSON.stringify(questions));

          // Redirect to the quiz page
          window.location.href = baseUrl + "/quiz";
        } catch (error) {
          console.error(error);
          alert("An error occurred while fetching the quiz data.");
        }
      });
    });
  }

  attachQuizListeners();

  let selectedFile = null;

  const validateFile = (file) => {
    return file.type === "application/pdf" && file.size <= 5 * 1024 * 1024;
  };

  const encodeFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject("Error reading file");
    });

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#007bff";
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "#ccc";
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#ccc";
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    handleFile(file);
  });

  const handleFile = (file) => {
    if (validateFile(file)) {
      selectedFile = file;
      dropZone.textContent = file.name;
      generateBtn.disabled = false;
    } else {
      alert("Invalid file. Please upload a PDF under 5MB.");
    }
  };

  generateBtn.addEventListener("click", async () => {
    console.log("clicked");
    if (!selectedFile) return;

    generateBtn.disabled = true;
    status.textContent = "Generating quiz...";
    progressBar.style.display = "block";

    try {
      const encodedFile = await encodeFileAsBase64(selectedFile);

      const response = await fetch(baseUrl + "/gen_quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file: {
            name: selectedFile.name,
            type: selectedFile.type,
            data: encodedFile,
          },
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate quiz. Please try again.");
      }
      // Store quiz data
      const quizData = await response.json();
      console.log("Quiz Data:", quizData.text);
      localStorage.setItem("quizData", JSON.stringify(quizData.text));
      progressBarFill.style.width = "100%";
      status.textContent = "Quiz generated successfully!";
      window.location.href = baseUrl + "/quiz";
    } catch (error) {
      status.textContent = "Failed to process the file.";
      console.error(error);
    }
  });
});
