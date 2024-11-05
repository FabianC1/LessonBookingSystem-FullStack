var express = require("express");
var path = require("path");
var fs = require("fs");

const cors = require("cors");

var app = express();


let propertiesReader = require("properties-reader");
let propertiesPath = path.resolve(__dirname, "conf/db.properties");
let properties = propertiesReader(propertiesPath);
let dbPprefix = properties.get("db.prefix");
//URL-Encoding of User and PWD
//for potential special characters
let dbUsername = encodeURIComponent(properties.get("db.user"));
let dbPwd = encodeURIComponent(properties.get("db.pwd"));
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");
const uri = dbPprefix + dbUsername + ":" + dbPwd + dbUrl + dbParams;



const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
let db = client.db(dbName);

app.param('collectionName'
   , function (req, res, next, collectionName) {
      req.collection = db.collection(collectionName);
      return next();
});

app.get('/collections/:collectionName'
   , function (req, res, next) {
      req.collection.find({}).toArray(function (err, results) {
         if (err) {
            return next(err);
         }
         res.send(results);
      });
});



// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors());

var staticPath = path.join(__dirname, "Static");
app.use(express.static(staticPath));

// Sample lessons data
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

// Routing function 3: Responds to "POST /lessons" to add a new lesson
app.post("/lessons", function (req, res) {
   const newLesson = { id: 1111, subject: "REST API", location: "Brighton", price: 300, spaces: 100 };
   lessons.push(newLesson); // Add the new lesson to the lessons array
   res.json({ id: newLesson.id }); // Respond with the new lesson ID
});

// Routing function 4: Responds to "PUT /lessons/:id" to update lesson spaces
app.put("/lessons/:id", function (req, res) {
   const lessonId = parseInt(req.params.id);
   const lesson = lessons.find((lesson) => lesson.id === lessonId);

   if (lesson) {
      lesson.spaces *= 2; // Update spaces by doubling the current value
      res.json({ msg: 'success' }); // Respond with success message
   } else {
      res.status(404).json({ error: "Lesson not found" });
   }
});

// Routing function 5: Responds to "DELETE /lessons/:id" to remove a lesson
app.delete("/lessons/:id", function (req, res) {
   const lessonId = parseInt(req.params.id);
   const lessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId);

   if (lessonIndex !== -1) {
      lessons.splice(lessonIndex, 1); // Remove the lesson from the array
      res.json({ msg: 'success' }); // Respond with success message
   } else {
      res.status(404).json({ error: "Lesson not found" });
   }
});

// Last middleware: Handles 404 errors for undefined routes
app.use(function (req, res) {
   res.status(404).json({ error: "Operation not available" });
});

app.listen(3000, function () {
   console.log("App started on port 3000");
});
