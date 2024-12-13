// Import the modules we need
var express = require("express");
var fetch = require("node-fetch");
const session = require("express-session");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var mysql = require("mysql2");
var cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const local = false;
const baseUrl = local ? "/" : "https://www.doc.gold.ac.uk/usr/166/";

const db = mysql.createConnection({
  host: "localhost",
  user: "alari001",
  password: "1234",
  database: "pdf_quiz",
});
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to database");
});
global.db = db;
global.fetch = fetch;

// Create the express application object
const app = express();
const port = 8000;
app.use(express.json({ limit: "5mb" }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET, // Replace with a secure, random string
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to `true` if using HTTPS
  })
);

// Set up css

app.use(express.static(__dirname + "/public"));

// Set the directory where Express will pick up HTML files
// __dirname will get the current directory
app.set("views", __dirname + "/views");

// Tell Express that we want to use EJS as the templating engine
app.set("view engine", "ejs");

// Tells Express how we should process html files
// We want to use EJS's rendering engine
app.engine("html", ejs.renderFile);

// Define our data
var shopData = { shopName: "Bertie's Books" };

// Requires the main.js file inside the routes folder passing in the Express app and data as arguments.  All the routes will go in this file
require("./routes/main")(app, shopData, baseUrl);

// Start the web app listening
var server = app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);
