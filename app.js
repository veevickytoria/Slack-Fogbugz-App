var express = require("express");
var bodyParser = require('body-parser');
var request = require('request');
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

  var immediateTextArray =["Let's hope Fogbugz is working...", "Hold on tight...", "Looking it up...", "Working on it now..."]

  if (req.body.token == "y2ONQHnaruku0eV50W0j4AMl" && req.body.command == "/fogbugz") {
    var caseNumber = req.body.text
    var responseUrl = req.body.response_url
    console.log(req.body);
    var immediateText = immediateTextArray[Math.floor(Math.random() * immediateTextArray.length)];
    res.send(immediateText)

    var fogbugzRequest = {  "cmd": "search",
                          "token": "pmchhmpstpi0dmdc8tnls3fn0f3ta3",
                              "q": caseNumber,
                           "cols": ["sTitle", "sStatus", "sPersonAssignedTo", "ixPersonOpenedBy", "ixPriority", "sPriority", "latestEvent"] }

    request.post({
      url: "https://ixl.fogbugz.com/f/api/0/jsonapi",
      body: JSON.stringify(fogbugzRequest)
    }, function(error, response, body){
      if(error || response.statusCode !== 200){
        res.send("Ooops, there's something wrong with Fogbugz");
      }
      else {
        console.log(body);
        var jsonBody = JSON.parse(body)
        console.log(jsonBody);
        var responseCases = jsonBody.data.cases
        for (var i = 0; i < responseCases.length; i++){
          var fCase = responseCases[i]

          var slackResponse = {
                        "response_type": "in_channel",
                        "text": "Fogbugz Info",
                        "attachments": [
                                { "title": fCase.sTitle,
                                  "title_link": "https://ixl.fogbugz.com/f/cases/"+ caseNumber + "/",
                                  "text": "Status: " + fCase.sStatus + "\n"
                                  + "Priority: " + fCase.ixPriority + " - " + fCase.sPriority + "\n"
                                  + "Assigned To: " + fCase.sPersonAssignedTo + "\n"
                                  + "Opened By: " + fCase.ixPersonOpenedBy
                                }
                              ]}

          request.post({
            url: responseUrl,
            body: JSON.stringify(slackResponse)
          }, function(error, response, body){
          });
        }
      }
    });
  }
});

// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);
