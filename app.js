var express = require("express");
var path = require("path");
var fs = require("fs");



var app = express();

var staticPath = path.join(__dirname, "Static");
app.use(express.static(staticPath));


app.use(function (req, res) {
   res.status(404);
   res.send("File not found!");
});
app.listen(3000, function () {
   console.log("App started on port 3000");
});



