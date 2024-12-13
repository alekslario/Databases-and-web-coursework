-- Insert users
INSERT INTO users (username, password_hash) VALUES
    ('jj', '$2b$10$vmjV5qltmc5tX4HRn/uE..C8Pg1jjcqWeChPZZRYeSrlOQdR1oxYC'),
    ('alice_smith', '$2b$10$P/lePmfkGicZwToLiKz4ru27CF8/V6Xoxt7ed29zWdJSRMBy44kXW');

-- Insert quizzes
INSERT INTO quizzes (title, user_id) VALUES
    ('General Knowledge Quiz', 1),
    ('Science Trivia', 1),
    ('History Quiz', 2);

-- Insert questions
INSERT INTO questions (question, correct_answer_letter, quiz_id) VALUES
    ('What is the capital of France?', 'A', 1),
    ('Which planet is known as the Red Planet?', 'B', 2),
    ('Who was the first President of the USA?', 'C', 3),
    ('What is the chemical symbol for water?', 'D', 2),
    ('What year did World War II end?', 'A', 3);

-- Insert answers for question_id = 1 (Capital of France, quiz_id = 1)
INSERT INTO answers (answer, answer_letter, question_id, quiz_id) VALUES
    ('Paris', 'A', 1, 1),
    ('Berlin', 'B', 1, 1),
    ('Madrid', 'C', 1, 1),
    ('Rome', 'D', 1, 1);

-- Insert answers for question_id = 2 (Red Planet, quiz_id = 2)
INSERT INTO answers (answer, answer_letter, question_id, quiz_id) VALUES
    ('Venus', 'A', 2, 2),
    ('Mars', 'B', 2, 2),
    ('Jupiter', 'C', 2, 2),
    ('Saturn', 'D', 2, 2);

-- Insert answers for question_id = 3 (First President, quiz_id = 3)
INSERT INTO answers (answer, answer_letter, question_id, quiz_id) VALUES
    ('George Washington', 'C', 3, 3),
    ('Abraham Lincoln', 'A', 3, 3),
    ('Thomas Jefferson', 'B', 3, 3),
    ('John Adams', 'D', 3, 3);

-- Insert answers for question_id = 4 (Chemical symbol for water, quiz_id = 2)
INSERT INTO answers (answer, answer_letter, question_id, quiz_id) VALUES
    ('H2O', 'D', 4, 2),
    ('CO2', 'A', 4, 2),
    ('O2', 'B', 4, 2),
    ('N2', 'C', 4, 2);

-- Insert answers for question_id = 5 (End of WWII, quiz_id = 3)
INSERT INTO answers (answer, answer_letter, question_id, quiz_id) VALUES
    ('1945', 'A', 5, 3),
    ('1939', 'B', 5, 3),
    ('1940', 'C', 5, 3),
    ('1944', 'D', 5, 3);