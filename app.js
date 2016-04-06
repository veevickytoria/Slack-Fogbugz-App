var express = require("express");
var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Set up a URL route
app.get("/", function(req, res) {
 res.send("Heroku Demo!");
});

app.post("/fogbugz", function(req, res) {
  console.log("Command received");
  console.log(req.body);
  var text = res.json(req.body);
  res.send(text)
});

// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);
