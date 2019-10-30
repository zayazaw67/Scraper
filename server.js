var express = require('express');
var exhbs = require('express-handlebars')
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 9090;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// create and connect to mongoDB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true }),

app.get('/scrape', function (req, res) {
    axios.get('http://books.toscrape.com').then(function (response) {
        var $ = cheerio.load(response.data);
        // console.log(response.data)
        $("article h2").each(function (i, element) {

            var result = {};

            result.title = $(element).text();
            result.link = $(element).children().attr("href");

            Article.create(result).then(function (dbArticle) {
                console.log(dbArticle);
            }).catch(function (err) {
                console.log(err);
            });
        });
        res.send("Job's done")
    });
});


// putting stuff to index
app.get("/", function (req, res) {
    db.Article.find({ "saved": false }, function (err, data) {
        var hbsObject = {
            data: data
        };
        console.log(hbsObject);
        res.render("index", hbsObject);
    });
});

app.listen(PORT, function () {
    console.log("Listening on port %s. Visit http://localhost:%s/ in your browser.", PORT, PORT);
});