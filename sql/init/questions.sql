CREATE TABLE IF NOT EXISTS questions (
    question_id INT PRIMARY KEY AUTO_INCREMENT,
    question TEXT NOT NULL,
    correct_answer_letter enum('A', 'B', 'C', 'D') NOT NULL,
    quiz_id INT NOT NULL,
    FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id)
);