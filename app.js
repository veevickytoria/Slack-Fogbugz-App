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

  if (req.body.token === "y2ONQHnaruku0eV50W0j4AMl" && req.body.command === "/fogbugz") {

    console.log(req.body)
    var reqText = req.body.text

    var helpText = "Valid commands: [case number], details [case number] (coming soon) \n" +
                    "To get quick info about a case: /fogbugz 12345 \n" +
                    "To get more detailed info about a case /fogbugz details 12345 \n" +
                    "Not working properly? Improvement suggestions? message me <@vzheng>"
    var errorText = "Sorry, " + req.body.text + " doesn't look like a valid command. \n" + helpText

    if (reqText) {
        var responseUrl = req.body.response_url
        var tokens = reqText.split(" ")
        var command = tokens[0].toString()
        console.log("Command: " + command)

        if (command === "help") {
            res.send(helpText)
        }
        else if (command === "details") {
            if (tokens.length == 2) {
              var caseNumber = tokens[1]
              if (caseNumber && isCaseNumber(caseNumber)) {
                res.send("Details about a case is coming soon. In the mean time ....")
                getFogbugzCase(caseNumber, responseUrl)
              }
              else {
                res.send(errorText)
              }
            }
            else {
              res.send(errorText)
            }

        }
        else if (isCaseNumber(command)) {
          var immediateText = immediateTextArray[Math.floor(Math.random() * immediateTextArray.length)];
          res.send(immediateText)

          getFogbugzCase(command, responseUrl)
        }
        else {
          res.send(errorText)
        }
    }
    else {
      res.send(helpText)
    }
  }
});

var immediateTextArray =["Let's hope Fogbugz is working...", "Hold on tight...", "Looking it up...", "Working on it now..."]

var isCaseNumber = function(number) {
  return !isNaN(number) && parseInt(Number(number)) == number && !isNaN(parseInt(number, 10))
}

var getFogbugzCase = function(query, responseUrl) {

  var fogbugzRequest = {  "cmd": "search",
                        "token": "pmchhmpstpi0dmdc8tnls3fn0f3ta3",
                            "q": query,
                         "cols": ["ixBug", "sTitle", "sStatus", "sPersonAssignedTo", "ixPriority", "sPriority", "dtLastUpdated"] }

  request.post({
    url: "https://ixl.fogbugz.com/f/api/0/jsonapi",
    body: JSON.stringify(fogbugzRequest)
  }, function(error, response, body){
    if(error || response.statusCode !== 200){
      res.send("Ooops, there's something wrong with Fogbugz");
    }
    else {
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
                              { "title": fCase.ixBug + ": " + fCase.sTitle,
                                "title_link": "https://ixl.fogbugz.com/f/cases/"+ fCase.ixBug + "/",
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

// bind the app to listen for connections on a specified port
var port = process.env.PORT || 3000;
app.listen(port);
