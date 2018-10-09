"use strict"

const AWS = require("aws-sdk")

const TOPIC_ARN = process.env.TOPIC_ARN

// Handler is the Lambda and SNS specific code
// The message generation logic is separated from the handler itself
// in the
const handler = (event, context, callback) => {
  const message = createEvent()

  const sns = new AWS.SNS()

  const params = {
    Message: JSON.stringify(message),
    TopicArn: TOPIC_ARN,
  }

  sns.publish(params, (error, data) => {
    if (error) {
      callback(error)
    }

    callback(null, {
      message: 'Message successfully published to SNS topic "pact-events"',
      event,
    })
  })

  callback(null, message)
}

// Separate your producer code, from the lambda handler.
// No Lambda/AWS/Protocol specific stuff in here..
const createEvent = obj => {
  // Change 'type' to something else to test a pact failure
  return {
    id: parseInt(Math.random() * 100),
    event: "an update to something useful",
    type: "update",
  }
}

module.exports = {
  handler,
  createEvent,
}
