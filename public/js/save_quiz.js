document.addEventListener("DOMContentLoaded", () => {
  let quizData = localStorage.getItem("quizData");
  quizData = JSON.parse(quizData);
  let userAnswers = localStorage.getItem("userAnswers");
  userAnswers = JSON.parse(userAnswers);
  const options = ["A", "B", "C", "D"];
  if (!quizData || !userAnswers) {
    alert("No quiz data found.");
    return;
  }

  const quizReviewContainer = document.querySelector(".quiz-review");

  quizData.forEach((question, index) => {
    const questionCard = document.createElement("div");
    questionCard.classList.add("question-card");

    const questionTitle = document.createElement("h2");
    questionTitle.textContent = `Question ${index + 1}: ${question.question}`;
    questionCard.appendChild(questionTitle);

    const optionsList = document.createElement("ul");
    optionsList.classList.add("options-list");
    question.options.forEach((option, index) => {
      const optionItem = document.createElement("li");
      optionItem.classList.add("option");

      // Add text for the option
      const optionText = document.createElement("span");
      optionText.textContent = option;

      // Add visual indicators
      const indicator = document.createElement("span");
      indicator.classList.add("indicator");
      if (question.answer === options[index]) {
        indicator.textContent = " ✔";
        indicator.classList.add("checkmark");
      }

      if (
        userAnswers[index] !== question.answer &&
        userAnswers[index] === options[index]
      ) {
        indicator.textContent = " ✖";
        indicator.classList.add("cross");
      }

      // Append the text and indicator to the option item
      optionItem.appendChild(optionText);
      optionItem.appendChild(indicator);

      optionsList.appendChild(optionItem);
    });

    questionCard.appendChild(optionsList);
    quizReviewContainer.appendChild(questionCard);

    // data that will be submitted
    const hiddenQuizDataInput = document.createElement("input");
    hiddenQuizDataInput.type = "hidden";
    hiddenQuizDataInput.name = "data";
    hiddenQuizDataInput.value = JSON.stringify({ quizData, userAnswers });
    quizReviewContainer.appendChild(hiddenQuizDataInput);
  });
});
