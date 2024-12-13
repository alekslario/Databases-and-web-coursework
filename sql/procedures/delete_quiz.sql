DELIMITER //

CREATE PROCEDURE DeleteQuiz(IN quizIdToDelete INT)
BEGIN
  
    -- Delete questions and answers associated with the quiz
    DELETE FROM answers WHERE quiz_id = quizIdToDelete;

    DELETE FROM questions WHERE quiz_id = quizIdToDelete;

    -- Delete the post
    DELETE FROM quizzes WHERE quiz_id = quizIdToDelete;

END //

DELIMITER ;