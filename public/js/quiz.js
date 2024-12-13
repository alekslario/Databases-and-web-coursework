document.addEventListener("DOMContentLoaded", () => {
  const quizContainer = document.getElementById("quiz-container");
  const progressBar = document.getElementById("progress-bar");
  const answeredCount = document.getElementById("answered-count");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  let answered = 0,
    currentQuestionIndex = 0;
  const local = false;
  const baseUrl = local ? "/" : "https://www.doc.gold.ac.uk/usr/166";

  let quizData =
    localStorage.getItem("quizData") ||
    (() => {
      window.location.href = baseUrl;
      return;
    })();

  quizData = JSON.parse(quizData);

  const userAnswers = [];

  const updateProgress = () => {
    progressBar.style.width = `${
      ((currentQuestionIndex + 1) / quizData.length) * 100
    }%`;
  };

  const updateAnsweredCount = () => {
    answeredCount.textContent = `${answered}/${quizData.length}`;
  };

  const togglePrevButton = () => {
    prevBtn.disabled = currentQuestionIndex === 0;
  };

  const toggleNextButton = () => {
    nextBtn.textContent =
      currentQuestionIndex === quizData.length - 1 ? "Finish" : "Next";
    nextBtn.disabled =
      currentQuestionIndex === quizData.length - 1 &&
      answered < quizData.length;
  };

  const renderQuestion = () => {
    const { question, options, answer } = quizData[currentQuestionIndex];

    const questionCard = document.querySelector(".question-card");
    questionCard.innerHTML = `<h2>${question}</h2><div class="options-container"></div>`;
    const optionsContainer = questionCard.querySelector(".options-container");

    options.forEach((option, i) => {
      const letter = ["A", "B", "C", "D"][i];
      const btn = document.createElement("button");
      btn.className = "btn option";
      btn.textContent = `${letter}: ${option}`;
      btn.dataset.answer = letter;

      if (userAnswers[currentQuestionIndex]) {
        const selected = userAnswers[currentQuestionIndex];
        btn.disabled = true;

        if (letter === answer) {
          btn.classList.add("correct");
        } else if (letter === selected) {
          btn.classList.add("incorrect");
        }
      }

      btn.addEventListener("click", (e) => {
        if (!userAnswers[currentQuestionIndex]) answered++;
        userAnswers[currentQuestionIndex] = e.target.dataset.answer;
        updateAnsweredCount();
        document.querySelectorAll(".btn.option").forEach((b) => {
          b.disabled = true;
          if (b.dataset.answer === answer) b.classList.add("correct");
          if (
            b.dataset.answer === userAnswers[currentQuestionIndex] &&
            b.dataset.answer !== answer
          ) {
            b.classList.add("incorrect");
          }
        });
        toggleNextButton();
      });

      optionsContainer.appendChild(btn);
    });

    toggleNextButton();
  };

  prevBtn.addEventListener("click", () => {
    if (currentQuestionIndex > 0) {
      currentQuestionIndex--;
      renderQuestion();
      updateProgress();
      togglePrevButton();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentQuestionIndex < quizData.length - 1) {
      currentQuestionIndex++;
      renderQuestion();
      updateProgress();
      togglePrevButton();
    } else {
      // Submit quiz
      // save userAnswers to localStorage
      localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
      window.location.href = baseUrl + "/save_quiz";
    }
  });

  updateProgress();
  updateAnsweredCount();
  renderQuestion();
  togglePrevButton();
});
