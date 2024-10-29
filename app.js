var express = require("express");
var path = require("path");
var fs = require("fs");

var app = express();

var staticPath = path.join(__dirname, "Static");
app.use(express.static(staticPath));

// Sample lessons data moved to app.js
const lessons = [
    { id: 1, subject: "Math", location: "Room 101", price: 50, spaces: 3, image: "images/maths.png", duration: 2 },
    { id: 2, subject: "Science", location: "Room 102", price: 60, spaces: 5, image: "images/science.jpg", duration: 1.5 },
    { id: 3, subject: "History", location: "Room 103", price: 40, spaces: 2, image: "images/history.jpeg", duration: 1 },
    { id: 4, subject: "English", location: "Room 104", price: 45, spaces: 0, image: "images/english.png", duration: 2 },
    { id: 5, subject: "Art", location: "Room 105", price: 55, spaces: 4, image: "images/art.jpg", duration: 2.5 },
    { id: 6, subject: "Music", location: "Room 106", price: 70, spaces: 1, image: "images/music.png", duration: 1.5 },
    { id: 7, subject: "Physics", location: "Room 107", price: 65, spaces: 5, image: "images/physics.png", duration: 2 },
    { id: 8, subject: "Chemistry", location: "Room 108", price: 50, spaces: 0, image: "images/chemistry.jpeg", duration: 1.5 },
    { id: 9, subject: "Biology", location: "Room 109", price: 60, spaces: 2, image: "images/biology.png", duration: 1 },
    { id: 10, subject: "Geography", location: "Room 110", price: 50, spaces: 3, image: "images/geography.jpg", duration: 2 }
];

// Middleware 1: Logs all incoming requests
app.use(function (req, res, next) {
    console.log("Request URL:", req.url);
    next();
});

// Middleware 2: Serves images if the file exists in the "Images" folder
app.use("/images", function (req, res, next) {
    var imagePath = path.join(staticPath, "Images", req.url);
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            next(); // File does not exist, move to the next middleware
        } else {
            res.sendFile(imagePath); // Serve the file if it exists
        }
    });
});

// Routing function 1: Responds to "GET /lessons" with all lessons as JSON
app.get("/lessons", function (req, res) {
    res.json(lessons);
});

// Routing function 2: Responds to "GET /lessons/:id" with lesson data by ID as JSON
app.get("/lessons/:id", function (req, res) {
    const lessonId = parseInt(req.params.id);
    const lesson = lessons.find((lesson) => lesson.id === lessonId);

    if (lesson) {
        res.json(lesson);
    } else {
        res.status(404).json({ error: "Lesson not found" });
    }
});

// Last middleware: Handles 404 errors
app.use(function (req, res) {
    res.status(404).send("Resource not found");
});

app.listen(3000, function () {
    console.log("App started on port 3000");
});
