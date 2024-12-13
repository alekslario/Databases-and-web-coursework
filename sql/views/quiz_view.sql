CREATE VIEW quiz_view AS
SELECT 
    u.user_id as user_id,
    qz.quiz_id as quiz_id,  -- Including quiz_id for the WHERE clause
    qz.title AS quiz_name,
    qs.question_id,
    qs.question,
    qs.correct_answer_letter,
    ans.answer_id,
    ans.answer,
    ans.answer_letter
FROM 
    users u
JOIN 
    quizzes qz ON u.user_id = qz.user_id
JOIN 
    questions qs ON qz.quiz_id = qs.quiz_id
JOIN 
    answers ans ON qs.question_id = ans.question_id;