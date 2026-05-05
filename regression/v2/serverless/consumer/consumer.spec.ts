import path from 'node:path';
import {
  type LogLevel,
  MatchersV2 as Matchers,
  MessageConsumerPact,
  synchronousBodyHandler,
} from '@pact-foundation/pact';
import { describe, it } from 'vitest';
import { consumeEvent } from './index';

const { like, term } = Matchers;

const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

describe('Serverless consumer tests', () => {
  const messagePact = new MessageConsumerPact({
    consumer: 'SNSPactEventConsumer',
    dir: path.resolve(__dirname, '..', 'pacts'),
    provider: 'SNSPactEventProvider',
    logLevel: LOG_LEVEL as LogLevel,
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
