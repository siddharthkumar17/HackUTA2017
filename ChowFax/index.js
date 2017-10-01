var http = require('http');

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        
        if (event.session.application.applicationId !== "amzn1.ask.skill.b2ad8ad6-23ea-43e9-b300-873ebe9c1a63") 
        {
             context.fail("Invalid Application ID");
        }
        

        if (event.session.new) 
        {

            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") 
        {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse)
                {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        }
        else if (event.request.type === "IntentRequest") 
        {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) 
                {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } 
        else if (event.request.type === "SessionEndedRequest") 
        {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } 
    catch (e) 
    {
        context.fail("Exception: " + e);
    }
};

function api(endpoint, cb) 
{

    return http.get({
        host: 'api.edamam.com',
        path: '/search?q='+endpoint+'&app_id=d1699eab&app_key=0567e6dbf7e32988ff482ef1e1a0bd05&from=0&to=1'
    }, function(res) {
        res.setEncoding('utf8');
        
        var body = '';
        res.on('data', function(d) {
            body += d;
        });
        res.on('end', function() {

            try 
            {
                console.log(body);
                var parsed = JSON.parse(body);
                cb(parsed.MRData);
                //return parsed.MRData;
            } 
            catch (err) 
            {
                console.error('Unable to parse response as JSON', err);
                throw(err);
            }
        });
    }).on('error', function(err) {
        // handle errors with the request itself
        console.error('Error with the request:', err.message);
        throw(err);
    });

}


function onSessionStarted(sessionStartedRequest, session) 
{
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}


function onLaunch(launchRequest, session, callback) 
{
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}


function onIntent(intentRequest, session, callback) 
{
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;
    
    this.cb = callback;

    switch(intentName) 
    {
        case "NutritionFactsNumerical":
            api(intentRequest.intent.slots.food.value, function(ingred) 
            {
                
                var cardTitle = intentRequest.intent.slots.food.value;
                var shouldEndSession = true;
                var speechOutput = intentRequest.intent.slots.food.value+" has "+ ingred ;
                    
            
                this.cb({}, buildSpeechletResponse(cardTitle, speechOutput, speechOutput, shouldEndSession));
                
            }.bind(this));
            break;
          
        case "AMAZON.HelpIntent":
                getWelcomeResponse(callback);
            break;
        
        case "AMAZON.StopIntent":
        case "AMAZON.CancelIntent":
        default:
            handleSessionEndRequest(callback);
            break;
    }
    
}

function onSessionEnded(sessionEndedRequest, session) 
{
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId + ", sessionId=" + session.sessionId);
    
}

function getWelcomeResponse(callback) 
{
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "What food would you like to know more about?";
    var repromptText = "Here are some things you can say: " +
        "How many calories does peanuts have " +
        "How much protein is in salmon" +
        "So, how can I help?";
    var shouldEndSession = false;

    callback(sessionAttributes, buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) 
{
    var cardTitle = ""; //"Session Ended";
    var speechOutput = ""; //"Thank you for trying the Alexa Skills Kit sample. Have a nice day!";

    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession) {
 
    return 
    {
        outputSpeech: 
        {
            type: "PlainText",
            text: speechOutput
           // title: "<speak>"+speechOutput+"</speak>"
        },
        card: 
        {
            type: "Simple",
            title: cardTitle,
            content: speechOutput
        },
        reprompt: 
        {
            outputSpeech: 
            {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) 
{
    return 
    {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}