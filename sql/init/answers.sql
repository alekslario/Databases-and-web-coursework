CREATE TABLE IF NOT EXISTS answers (
    answer_id INT PRIMARY KEY AUTO_INCREMENT,
    answer TEXT NOT NULL,
    answer_letter ENUM('A', 'B', 'C', 'D') NOT NULL,
    question_id INT NOT NULL,
    quiz_id INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(question_id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id)
);