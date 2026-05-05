import AWS from 'aws-sdk';

const TOPIC_ARN = process.env.TOPIC_ARN;

// Handler is the Lambda and SNS specific code
// The message generation logic is separated from the handler itself
// in the
export const handler = (event, _context, callback) => {
  const message = createEvent();

  const sns = new AWS.SNS();

  const params = {
    Message: JSON.stringify(message),
    TopicArn: TOPIC_ARN,
  };

  sns.publish(params, (error, _data) => {
    if (error) {
      callback(error);
      return;
    }

    callback(null, {
      message: 'Message successfully published to SNS topic "pact-events"',
      event,
    });
  });
};

// Separate your producer code, from the lambda handler.
// No Lambda/AWS/Protocol specific stuff in here..
export const createEvent = (_obj?) => {
  // Change 'type' to something else to test a pact failure
  return {
    id: parseInt(String(Math.random() * 100), 10),
    event: 'an update to something useful',
    type: 'update',
  };
};
