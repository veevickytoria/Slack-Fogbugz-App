var express = require("express");
var bodyParser = require('body-parser');
var request = require('request');
var moment = require('moment-timezone');
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

  if (req.body.token === "y2ONQHnaruku0eV50W0j4AMl" && req.body.command === "/fogbugz") {

    console.log(req.body)
    var reqText = req.body.text

    var helpText = "Valid commands: [case number], details [case number] (coming soon) \n" +
                    "To get quick info about a case: /fogbugz 12345 \n" +
                    "To get more detailed info about a case /fogbugz details 12345 \n" +
                    "Not working properly? Improvement suggestions? message me <@vzheng>"

    if (reqText) {
        var tokens = reqText.split(" ")
        var command = tokens[0].toString()
        console.log("Command: " + command)
        if (command === "help") {
            res.send(helpText)
        }
        else if (command === "details") {
            res.send("coming soon")
        }
        else if (isNaN(command) && parseInt(Number(command)) == command && !isNaN(parseInt(command, 10))) {
          var responseUrl = req.body.response_url
          console.log(req.body);
          var immediateText = immediateTextArray[Math.floor(Math.random() * immediateTextArray.length)];
          res.send(immediateText)

          var fogbugzRequest = {  "cmd": "search",
                                "token": "pmchhmpstpi0dmdc8tnls3fn0f3ta3",
                                    "q": reqText,
                                 "cols": ["sTitle", "sStatus", "sPersonAssignedTo", "ixPriority", "sPriority", "dtLastUpdated"] }

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
                var localDate = moment.utc(fCase.dtLastUpdated).toDate();

                var slackResponse = {
                              "response_type": "in_channel",
                              "text": "Fogbugz Info",
                              "attachments": [
                                      { "title": reqText + ": " + fCase.sTitle,
                                        "title_link": "https://ixl.fogbugz.com/f/cases/"+ reqText + "/",
                                        "text": "Status: " + fCase.sStatus + "\n"
                                        + "Priority: " + fCase.ixPriority + " - " + fCase.sPriority + "\n"
                                        + "Assigned To: " + fCase.sPersonAssignedTo + "\n"
                                        + "Last Edit: " + moment.tz(localDate, "America/Los_Angeles").format("L LT z")
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
        else {
          var errorText = "Sorry, " + req.body.text + " doesn't look like a valid command. \n" + helpText
          res.send(errorText)
        }
    }
    else {
      res.send(helpText)
    }
  }
});

// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);
