var express = require("express");
var path = require("path");
var fs = require("fs");

var app = express();

var staticPath = path.join(__dirname, "Static");
app.use(express.static(staticPath));

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
   // Replace this with your actual lessons data source
   const lessons = [
      { id: 1, name: "Math", price: 30 },
      { id: 2, name: "Science", price: 40 },
      // Add more lessons as needed
   ];
   res.json(lessons);
});

// Routing function 2: Responds to "GET /lessons/:id" with lesson data by ID as JSON
app.get("/lessons/:id", function (req, res) {
   const lessonId = parseInt(req.params.id);
   // Replace this with your actual lessons data source
   const lessons = [
      { id: 1, name: "Math", price: 30 },
      { id: 2, name: "Science", price: 40 },
      // Add more lessons as needed
   ];
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
