const { verifyToken } = require("../util/token");
const { query } = require("../util/query");
const fetch = require("node-fetch");

const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

module.exports = function (app, shopData, baseUrl) {
  // let stub = [
  //   {
  //     answer: "A",
  //     options: [
  //       "The document primarily focuses on the benefits of machine learning.",
  //       "The document is an advertisement for IBM products and services.",
  //       "The document is a technical manual for machine learning algorithms.",
  //       "The document contains links to various resources related to machine learning, but doesn't focus on any one aspect in particular",
  //     ],
  //     question: "What is the main subject or purpose of the provided document?",
  //   },
  //   {
  //     answer: "C",
  //     options: [
  //       "The links primarily focus on IBM's machine learning.",
  //       "The links primarily focus on various types of neural networks.",
  //       "The links are a mixture of resources from IBM and other sources, relating to machine learning.",
  //       "The links are all from journals and peer-reviewed publications on machine learning",
  //     ],
  //     question:
  //       "What can be said about the nature of the links included in the document?",
  //   },
  //   {
  //     answer: "B",
  //     options: [
  //       "The document does not contain any questions.",
  //       "The document contains multiple links to online resources on a range of machine learning topics.",
  //       "The document provides a detailed technical explanation of one particular machine learning technique.",
  //       "The document is a simple, non-technical overview of machine learning suitable for beginners",
  //     ],
  //     question:
  //       "Which of the following best describes the content and style of the document?",
  //   },
  //   {
  //     answer: "D",
  //     options: [
  //       "There is one link in the document, to a single machine learning resource.",
  //       "There are 2-5 links related to one subtopic of machine learning.",
  //       "There are several links to resources on specific machine learning algorithms and applications.",
  //       "There are numerous links to various resources about machine learning, covering a broad range of topics",
  //     ],
  //     question:
  //       "How many links to resources about machine learning are present in the document, and how are the topics covered?",
  //   },
  // ];
  const questionSchema = {
    type: "OBJECT",
    properties: {
      question: {
        type: "STRING",
        description: "The question being asked.",
      },
      options: {
        type: "ARRAY",
        items: {
          type: "STRING",
          description: "An answer option for the question.",
        },
        minItems: 4,
        maxItems: 4,
        description:
          "Four possible answers to the question. Only one should be correct, and they should all be of equal lengths.",
      },
      answer: {
        type: "STRING",
        description: "The correct answer. Valid values are 'A', 'B', 'C', 'D'.",
        enum: ["A", "B", "C", "D"],
      },
    },
    required: ["question", "options", "answer"],
    description: "Schema for a single question.",
  };

  const schema = {
    type: "ARRAY",
    items: questionSchema,
    minItems: 4,
    maxItems: 4,
    description: "An array of exactly 4 questions.",
  };

  app.post("/gen_quiz", async function (req, res) {
    try {
      const { file } = req.body; // Extract data from the parsed body
      const { data } = file;

      // Validate that 'data' exists
      if (!data) {
        return res.status(400).send("No data provided.");
      }

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_API_KEY}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Create a multiple choice test based on topics discussed in the pdf. It is exam prep. Each option should be roughly equal in length. (base64) Pdf: ${data}`,
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: "application/json",
            response_schema: schema, // Use your predefined schema here
          },
        }),
      });

      const textString = response.text();
      // const text = stub;
      const text = JSON.parse(textString);
      return res.status(200).json({ text });
    } catch (error) {
      console.error("Error generating quiz:", error.message);
      res.status(500).send("Failed to generate quiz. Please try again.");
    }
  });
  app.get("/search", function (req, res) {
    const query = req.query;

    const userId = verifyToken(req);
    // we got quiz id but not token
    if (!userId) {
      return res.redirect("/login");
    }

    if (!query) {
      // empty query return default page
      // search quizz with the matching name and smae user_id
      let sqlquery = "SELECT * FROM quizzes_view WHERE user_id = ?";
      db.query(sqlquery, [userId], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: "Error searching for quiz" });
        } else {
          let data = result.map((row) => ({
            title: row.quiz_title,
            questionCount: row.question_count,
            correctAnswers: row.correct_answers,
            quiz_id: row.quiz_id,
          }));
          res.status(200).json({ quizzes: data });
        }
      });
    }

    // search quizz with the matching name and smae user_id
    let sqlquery =
      "SELECT * FROM quizzes_view WHERE user_id = ? AND quiz_title LIKE ?";
    db.query(sqlquery, [userId, `%${query.q}%`], (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: "Error searching for quiz" });
      } else {
        let data = result.map((row) => ({
          title: row.quiz_title,
          questionCount: row.question_count,
          correctAnswers: row.correct_answers,
          quiz_id: row.quiz_id,
        }));
        res.status(200).json({ quizzes: data });
      }
    });
  });

  app.get("/quiz", function (req, res) {
    res.render("quiz", { user: !!req.cookies.userToken });
  });
  app.get("/quiz/:quizId", async (req, res) => {
    const { quizId } = req.params;
    if (!quizId) {
      //render default quiz page
      // everything else is handled by the frontend
      return res.redirect("quiz");
    }

    const userId = verifyToken(req);
    // we got quiz id but not token
    if (!userId) {
      return res.redirect("/login");
    }

    try {
      // Query 1: Fetch quiz title and ID
      const quizData = await query(
        `
      SELECT quiz_id, title as quiz_name 
      FROM quizzes 
      WHERE quiz_id = ? AND user_id = ?
      `,
        [quizId, userId]
      );

      if (quizData.length === 0) {
        // If no quiz data, redirect to default quiz page
        return res.redirect("quiz");
      }

      const quizTitle = quizData[0].quiz_name;

      // Query 2: Fetch questions for the given quizId
      const questionData = await query(
        `
        SELECT question_id, question, correct_answer_letter 
        FROM questions 
        WHERE quiz_id = ?
        ORDER BY question_id
      `,
        [quizId]
      );

      // Process questions
      const questions = questionData.map((row) => ({
        questionId: row.question_id,
        question: row.question,
        answer: row.correct_answer_letter,
        options: [],
      }));

      // Query 3: Fetch answers for each question individually
      for (let question of questions) {
        const answerData = await query(
          `
        SELECT answer_id, answer, answer_letter 
        FROM answers 
        WHERE question_id = ?
        ORDER BY answer_letter
        `,
          [question.questionId]
        );

        // Add the answers to the respective question options
        question.options = answerData
          .map((row) => ({
            answerId: row.answer_id,
            answerText: row.answer,
            answerLetter: row.answer_letter,
          }))
          .sort((a, b) => a.answerLetter.localeCompare(b.answerLetter))
          .map((a) => a.answerText);
      }

      // Respond with quiz data
      res.json({ quizTitle, questions });
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Error fetching quiz data" });
    }
  });

  app.get("/save_quiz", function (req, res) {
    res.render("save_quiz", { user: !!req.cookies.userToken });
  });

  app.post("/save_quiz", async function (req, res) {
    const { data, title } = req.body;

    const { quizData, userAnswers } = JSON.parse(data[0]);

    if (!quizData || !userAnswers) {
      return res.redirect("/login");
    }
    const userId = verifyToken(req);
    if (!userId) {
      return res.redirect("/login");
    }

    // query to check if the user exists
    try {
      // Check if the user exists
      const userResult = await query("SELECT * FROM users WHERE user_id = ?", [
        userId,
      ]);
      if (userResult.length === 0) {
        res.clearCookie("userToken");
        return res.redirect("/login");
      }

      // Insert the quiz
      const quizResult = await query(
        "INSERT INTO quizzes (title, user_id) VALUES (?, ?)",
        [title, userId]
      );
      const quizId = quizResult.insertId;

      // Prepare all the questions and answers insertions
      const questionPromises = quizData.map(async (item) => {
        const questionResult = await query(
          "INSERT INTO questions (question, correct_answer_letter, quiz_id) VALUES (?, ?, ?)",
          [item.question, item.answer, quizId]
        );
        const questionId = questionResult.insertId;

        // Insert all answers for this question
        const answerPromises = item.options.map((option, idx) => {
          const answerLetter = String.fromCharCode(65 + idx);
          return query(
            "INSERT INTO answers (answer, answer_letter, question_id, quiz_id) VALUES (?, ?, ?, ?)",
            [option, answerLetter, questionId, quizId]
          );
        });

        // Wait for all answers to be inserted for this question
        return Promise.all(answerPromises);
      });

      // Wait for all questions and answers to be inserted
      await Promise.all(questionPromises);

      // Redirect after everything is completed
      res.redirect(baseUrl);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error saving quiz.");
    }
  });
};
