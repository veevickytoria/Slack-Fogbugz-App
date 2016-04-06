var express = require("express");
var app = express();

// Set up a URL route
app.get("/", function(req, res) {
 res.send("Heroku Demo!");
});

app.post("/fogbugz", function(req, res) {
  console.log("Command received");
  var text = req.body
  res.send(text)
});

// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);
