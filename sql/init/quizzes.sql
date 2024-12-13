CREATE TABLE IF NOT EXISTS quizzes (
    quiz_id INT PRIMARY KEY AUTO_INCREMENT,
    title TEXT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);