const gen_quiz = require("./gen_quiz");
const { generateToken, verifyToken } = require("../util/token");
const { len } = require("../util/validate");
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = function (app, shopData, baseUrl) {
  // handle post routes
  gen_quiz(app, shopData, baseUrl);
  // Handle our routes
  app.get("/", function (req, res) {
    //first check if user is logged in and get user_id
    //verify token
    const userId = verifyToken(req);
    if (!userId) {
      res.render("index.ejs", { quizzes: [], user: !!req.cookies.userToken });
      return;
    } else {
      //assuming there the user exists in the database even if the token is expired
      // query  the database if the user exists
      //query database for all the quizzes
      //using quizzes_view
      let sqlquery = "SELECT * FROM quizzes_view WHERE user_id = ?";
      db.query(sqlquery, [userId], (err, result) => {
        if (err) {
          console.error(err);
          res.render("index.ejs", {
            quizzes: [],
            user: !!req.cookies.userToken,
          });
        } else {
          let data = result.map((row) => ({
            title: row.quiz_title,
            questionCount: row.question_count,
            correctAnswers: row.correct_answers,
            quiz_id: row.quiz_id,
          }));
          res.render("index.ejs", {
            quizzes: data,
            user: !!req.cookies.userToken,
          });
        }
      });
    }
  });

  app.get("/about", function (req, res) {
    res.render("about.ejs", { user: !!req.cookies.userToken });
  });

  app.get("/login", function (req, res) {
    //clear the cookie
    res.clearCookie("userToken");
    res.render("login.ejs", { user: false });
  });

  app.get("/logout", function (req, res) {
    res.clearCookie("userToken");
    res.redirect(baseUrl);
  });

  app.post("/register", function (req, res) {
    const { username, password } = req.body;
    // validate the username and password
    if (!username || !password) {
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }

    if (!len(username, 4, 50) || !len(password, 4, 50)) {
      res.status(400).json({
        error: "Username and password must be between 4 and 50 characters",
      });
      return;
    }
    bcrypt.hash(password, saltRounds, function (err, hashedPassword) {
      // Store hashed password in your database.

      // Assuming you have a 'users' table with appropriate columns (e.g., username, password_hash)
      let sqlquery =
        "INSERT INTO users (username, password_hash) VALUES (?, ?)";

      // Execute the query to insert user data into the 'users' table
      db.query(sqlquery, [username, hashedPassword], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error registering user");
        } else {
          const user_id = result.insertId;
          const userToken = generateToken(user_id);
          // Set the 'userToken' cookie to the generated token
          // usually doesn't really really works like that, dummy token
          res.cookie("userToken", userToken, { maxAge: 900000 });

          // return success status
          res.status(200).json({ status: "User registered" });
        }
      });
    });
  });

  app.post("/login", function (req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: "Invalid username or password" });
      return;
    }
    db.query(
      "SELECT user_id, password_hash FROM users WHERE username = ?",
      [username],
      (err, userResult) => {
        if (err) {
          console.error(err);
          res
            .status(500)
            .json({ error: "Error login in. Please try again later." });
        } else {
          if (userResult.length > 0) {
            //found a user with the username, now it's time to check the password
            const hashedPassword = userResult[0].password_hash;
            bcrypt.compare(password, hashedPassword, function (err, result) {
              if (result === true) {
                const user_id = userResult[0].user_id;
                const userToken = generateToken(user_id);
                // Set the 'userToken' cookie to the generated token
                res.cookie("userToken", userToken, { maxAge: 900000 });
                // return success status
                res.status(200).json({ status: "User logged in" });
              } else {
                // User not found or invalid credentials
                res.status(401).json({ error: "Invalid username or password" });
              }
            });
          } else {
            // User not found or invalid credentials
            res.status(401).json({ error: "Invalid username or password" });
          }
        }
      }
    );
  });
};
