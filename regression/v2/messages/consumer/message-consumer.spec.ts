/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */

import {
  type LogLevel,
  MatchersV2 as Matchers,
  MessageConsumerPact,
  synchronousBodyHandler,
} from '@pact-foundation/pact';
import { describe, it } from 'vitest';

const { like, term } = Matchers;

import { dogApiHandler } from './dog-handler';

const path = require('node:path');
const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

describe('Message consumer tests', () => {
  const messagePact = new MessageConsumerPact({
    consumer: 'MyJSMessageConsumer',
    dir: path.resolve(__dirname, '..', 'pacts'),
    pactfileWriteMode: 'update',
    provider: 'MyJSMessageProvider',
    logLevel: LOG_LEVEL as LogLevel,
  });

  describe('receive dog event', () => {
    it('accepts a valid dog', () => {
      return messagePact
        .given('a dog named drover')
        .expectsToReceive('a request for a dog')
        .withContent({
          id: like(1),
          name: like('drover'),
          type: term({
            generate: 'bulldog',
            matcher: '^(bulldog|sheepdog)$',
          }),
        })
        .withMetadata({
          queue: like('animals'),
        })
        .verify(synchronousBodyHandler(dogApiHandler));
    });

    it('accepts a valid dog scenario 2', () => {
      return messagePact
        .given('a dog named rover')
        .expectsToReceive('a request for a dog')
        .withContent({
          id: like(1),
          name: like('rover'),
          type: term({
            generate: 'bulldog',
            matcher: '^(bulldog|sheepdog)$',
          }),
        })
        .withMetadata({
          queue: like('animals'),
        })
        .verify(synchronousBodyHandler(dogApiHandler));
    });
  });

  // This is an example of a pact breaking
  // uncomment to see how it works!
  it.skip('Does not accept an invalid dog', () => {
    return messagePact
      .given('some state')
      .expectsToReceive('a request for a dog')
      .withContent({
        name: 'fido',
      })
      .withMetadata({
        'content-type': 'application/json',
      })
      .verify(synchronousBodyHandler(dogApiHandler));
  });
});
