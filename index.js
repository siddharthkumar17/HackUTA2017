var isomorphicfetch = require('isomorphic-fetch');
var fetcher = require('fetch');
var speechOutput;
var reprompt;
const openingStatement = "Hello, what would you like to make?";
const potentialReprompt = "Have an idea for a food to create?";
const recipeIntro = "This recipe sounds good. Yum!";

const Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.d45b84e9-1b61-401d-b033-6f55ad943a29';
const handlers = {
  'LaunchRequest': function()
  {
      this.response.speak(openingStatement).listen(potentialReprompt);
      this.emit (':responseReady');
  },
  
  'AskForRecipes': function()
  {
  
   // var filledSlots = delegateSlotCollection.call(this);
    
    var alexaOutput = recipeIntro;
    
   // speechOutput="I am looking for recipes for "+this.event.request.intent.slots.foodName.value;
    

    fetch('https://api.edamam.com/search?q='+this.event.request.intent.slots.foodName.value+'&app_id=d1699eab&app_key=0567e6dbf7e32988ff482ef1e1a0bd05&from=0&to=1')
    .then(function(response){
      if (response.status !== 200) {  
        console.log('Looks like there was a problem. Status Code: ' +  
          response.status);  
        return;  
      }
      speechOutput = response.JSON.stringify();
      fetch('https://choppingboard.recipes/api/v0/recipe?key=e37918e0a0cf1f6605ba32134044ed6e&q='+response.JSON.hits[0].recipe.url)
      .then(function(response2){

          speechOutput = response.instructions;
             console.log(response.instructions);
      
      }).catch(function(error){
          console.log('Fetch Error :-S', error); 
      });
  })
.catch(function(error){
  console.log('Fetch Error :-S', error); 
});
    
    this.response.speak(speechOutput);
    this.emit(":responseReady");
  },
  
  'AMAZON.HelpIntent': function () {
        speechOutput = "HelpIntent";
        reprompt = "";
        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        speechOutput = "CancelIntent";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        speechOutput = "StopIntent";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
        var speechOutput = "SessionEndedRequest";
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
};
//Intent Handlers{} finished 

exports.handler = (event, context, callback) => {
    
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
    //callback(null,"complete");
};

/*function delegateSlotCollection(){
  console.log("in delegateSlotCollection");
  console.log("current dialogState: "+this.event.request.dialogState);
    if (this.event.request.dialogState === "STARTED") {
      console.log("in Beginning");
      var updatedIntent=this.event.request.intent;
      
      this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
      console.log("in not completed");
     
      this.emit(":delegate");
    } else {
      console.log("in completed");
      console.log("returning: "+ JSON.stringify(this.event.request.intent));
      
      return this.event.request.intent;
    }
}*/