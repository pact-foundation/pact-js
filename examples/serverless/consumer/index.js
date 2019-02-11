"use strict"

// Consumer handler, responsible for extracting message from SNS
// and dealing with lambda-related things.
const handler = (event, context, callback) => {
  console.log("Received event from SNS")

  event.Records.forEach(e => {
    console.log("Event:", JSON.parse(e.Sns.Message))
    consumeEvent(JSON.parse(e.Sns.Message))
  })

  callback(null, {
    event,
  })
}

let eventCount = 0

// Actual consumer code, has no Lambda/AWS/Protocol specific stuff
// This is the thing we test in the Consumer Pact tests
const consumeEvent = event => {
  console.log("consuming event", event)

  if (!event || !event.id) {
    throw new Error("Invalid event, missing fields")
  }

  // You'd normally do something useful, like process it
  // and save it in Dynamo
  console.log("Event count:", ++eventCount)

  return eventCount
}

module.exports = {
  handler,
  consumeEvent,
}
