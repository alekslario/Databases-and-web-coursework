CREATE OR REPLACE VIEW quizzes_view AS
SELECT 
    u.user_id AS user_id,
    qz.title AS quiz_title,
    qz.quiz_id AS quiz_id,
    COUNT(qs.question_id) AS question_count,
    SUM(CASE WHEN ans.answer_letter = qs.correct_answer_letter THEN 1 ELSE 0 END) AS correct_answers
FROM 
    users u
JOIN 
    quizzes qz ON u.user_id = qz.user_id
JOIN 
    questions qs ON qz.quiz_id = qs.quiz_id
JOIN 
    answers ans ON qs.question_id = ans.question_id
GROUP BY 
    qz.quiz_id
