/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */

import {
  Matchers,
  MessageConsumerPact,
  synchronousBodyHandler,
  LogLevel,
  PactV4,
} from '@pact-foundation/pact';
const { like, term } = Matchers;
import { dogApiHandler } from './dog-handler';

const path = require('path');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

describe('Message consumer tests', () => {
  const messagePact = new PactV4({
    consumer: 'MyJSMessageConsumerV4',
    provider: 'MyJSMessageProviderV4',
    logLevel: LOG_LEVEL as LogLevel,
  });

  describe('receive dog event', () => {
    it('accepts a valid dog', () => {
      return messagePact
        .addAsynchronousInteraction()
        .given('a dog named drover')
        .expectsToReceive('a request for a dog', (builder) => {
          builder
            .withJSONContent({
              id: like(1),
              name: like('drover'),
              type: term({
                generate: 'bulldog',
                matcher: '^(bulldog|sheepdog)$',
              }),
            })
            .withMetadata({
              queue: like('animals'),
            });
        })
        .executeTest(synchronousBodyHandler(dogApiHandler));
    });

    // it('accepts a valid dog scenario 2', () => {
    //   return messagePact
    //     .given('a dog named rover')
    //     .expectsToReceive('a request for a dog')
    //     .withContent({
    //       id: like(1),
    //       name: like('rover'),
    //       type: term({
    //         generate: 'bulldog',
    //         matcher: '^(bulldog|sheepdog)$',
    //       }),
    //     })
    //     .withMetadata({
    //       queue: like('animals'),
    //     })
    //     .verify(synchronousBodyHandler(dogApiHandler));
    // });
  });

  // This is an example of a pact breaking
  // uncomment to see how it works!
  // it.skip('Does not accept an invalid dog', () => {
  //   return messagePact
  //     .given('some state')
  //     .expectsToReceive('a request for a dog')
  //     .withContent({
  //       name: 'fido',
  //     })
  //     .withMetadata({
  //       'content-type': 'application/json',
  //     })
  //     .verify(synchronousBodyHandler(dogApiHandler));
  // });
});
