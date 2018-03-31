'use strict';

const AWS = require('aws-sdk');

// Consumer handler, responsible for extracting message from SNS
// and dealing with lambda-related things.
module.exports.handler = (event, context, callback) => {
  console.log("Received event from SNS");

  event.Records.forEach(e => {
    console.log("Event:", JSON.parse(e.Sns.Message));
    consumeEvent(e)
  });

  callback(null, {
    event
  });
};

// Actual consumer code, has no Lambda/AWS/Protocol specific stuff
// This is the thing we test in the Consumer Pact tests
const consumeEvent = (event) => {

  // save in dynamo or something...
  console.log('consuming event', event)

}
