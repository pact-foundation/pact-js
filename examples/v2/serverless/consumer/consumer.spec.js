/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
const consumeEvent = require('./index').consumeEvent;
const {
  MessageConsumerPact,
  MatchersV2: Matchers,
  synchronousBodyHandler,
} = require('@pact-foundation/pact');
const { like, term } = Matchers;
const path = require('path');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

describe('Serverless consumer tests', () => {
  const messagePact = new MessageConsumerPact({
    consumer: 'SNSPactEventConsumer',
    dir: path.resolve(process.cwd(), 'pacts'),
    provider: 'SNSPactEventProvider',
    logLevel: LOG_LEVEL,
  });

  describe('receive a pact event', () => {
    it('accepts a valid event', () => {
      return messagePact
        .expectsToReceive('a request to save an event')
        .withContent({
          id: like(1),
          event: like('something important'),
          type: term({ generate: 'save', matcher: '^(save|update|cancel)$' }),
        })
        .withMetadata({
          'content-type': 'application/json',
        })
        .verify(synchronousBodyHandler(consumeEvent));
    });
  });
});
