'use strict';

const AWS = require('aws-sdk');

const TOPIC_ARN = process.env.TOPIC_ARN;

// Handler is the Lambda and SNS specific code
// The message generation logic is separated from the handler itself
// in the
module.exports.handler = (event, context, callback) => {
  const message = createEvent(event);

  const sns = new AWS.SNS();

  const params = {
    Message: message.body,
    TopicArn: TOPIC_ARN
  };

  sns.publish(params, (error, data) => {
    if (error) {
      callback(error);
    }

    console.log("Message successfully published to queue")
    callback(null, {
      message: 'Message successfully published to SNS topic "pact-events"',
      event
    });
  });

  callback(null, message);
};

// Separate your producer code, from the lambda handler.
// No Lambda/AWS/Protocol specific stuff in here..
const createEvent = (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };
};
