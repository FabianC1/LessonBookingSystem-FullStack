var express = require("express");
var path = require("path");
var fs = require("fs");


var app = express();



app.use(express.static('Static'));


app.use(function (req, res) {
   res.status(404);
   res.send("File not found!");
});
app.listen(3000, function () {
   console.log("App started on port 3000");
});