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


// Middleware to parse JSON bodies
app.use(express.json());

app.use(cors());

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


app.param('collectionName'
   , function (req, res, next, collectionName) {
      req.collection = db.collection(collectionName);
      return next();
   });


app.get('/collections/:collectionName', async (req, res, next) => {
   const { collectionName } = req.params;  // Get the collection name from the URL
   try {
      const collection = db.collection(collectionName); // Dynamically access the collection
      const results = await collection.find().toArray(); // Fetch data from the collection
      res.json(results); // Send the results as JSON
   } catch (error) {
      next(error);  // Handle any errors
   }
});



app.get('/collections/:collectionName/subject/:subject', async function (req, res, next) {
   try {
      const subject = req.params.subject;
      const result = await req.collection.find({ subject: subject }).toArray();
      if (result.length === 0) {
         res.status(404).json({ error: "No lessons found for the given subject" });
      } else {
         res.json(result);
      }
   } catch (err) {
      next(err); // Handle potential errors
   }
});


app.get('/collections/:collectionName/:id', async function (req, res, next) {
   try {
      // Convert the provided :id (string) into MongoDB ObjectId
      const objectId = new ObjectId(req.params.id);

      // Use the collection from req.collection to query the lesson by _id
      const result = await req.collection.findOne({ _id: objectId });

      // If no result is found, return a 404 error
      if (!result) {
         return res.status(404).json({ error: "No lesson found with the given _id" });
      }

      // Send the found lesson as the response
      res.json(result);
   } catch (err) {
      // Handle any error that occurs during the process
      next(err);
   }
});



app.put('/collections/:collectionName/:id', function (req, res, next) {
   // Extract the spaces value from the request body
   const { spaces } = req.body;

   // Validate that spaces is a valid number
   if (typeof spaces !== 'number' || spaces < 0) {
      return res.status(400).json({ msg: "Invalid spaces value" });
   }

   // Update the lesson with the new spaces value
   req.collection.updateOne(
      { _id: new ObjectId(req.params.id) }, // Find the lesson by _id
      { $set: { spaces: spaces } }, // Update the spaces field
      { safe: true, multi: false }, // Ensure safe update and only one document
      function (err, result) {
         if (err) {
            return next(err); // Handle any errors
         } else {
            // Return success message if a lesson was found and updated
            res.send((result.matchedCount === 1) ? { msg: "success" } : { msg: "error" });
         }
      }
   );
});



app.post('/collections/:collectionName', async function (req, res, next) {
   const { collectionName } = req.params;  // Get the collection name from the URL
   const { name, phone, lessons } = req.body;

   // Validation: Ensure that 'name', 'phone', and 'lessons' are provided in the request
   if (!name || !phone || !Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({ error: 'Name, phone, and lessons are required' });
   }

   // Validate lesson IDs
   for (const lesson of lessons) {
      if (!ObjectId.isValid(lesson.lessonId)) {
         // Return the error response immediately if lessonId is invalid
         return res.status(400).json({ error: `Invalid lessonId: ${lesson.lessonId}` });
      }
   }

   // Now that all lesson IDs are validated, create the validLessons array
   const validLessons = lessons.map(lesson => ({
      lessonId: new ObjectId(lesson.lessonId), // Convert to ObjectId if valid
      subject: lesson.subject, // Include subject here
      spaces: lesson.spaces // spaces purchased for the lesson
   }));

   // Create the new order object
   const newOrder = {
      name: name,
      phone: phone,
      lessons: validLessons,
      createdAt: new Date() // timestamp for order creation
   };

   try {
      // Dynamically access the collection specified by the URL parameter
      const collection = db.collection(collectionName);  // 'Orders' collection if the URL is /collections/Orders

      // Insert the new order into the "Orders" collection
      const result = await collection.insertOne(newOrder);

      // Return a success response with the inserted order ID
      res.status(201).json({ message: 'Order created successfully', orderId: result.insertedId });
   } catch (error) {
      console.error(error);
      next(error);  // Pass the error to the error handler
   }
});







// Last middleware: Handles 404 errors for undefined routes
app.use(function (req, res) {
   res.status(404).json({ error: "Operation not available" });
});

app.listen(3000, function () {
   console.log("App started on port 3000");
});
