/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */

import {
  Matchers,
  v4SynchronousBodyHandler,
  LogLevel,
  Pact,
} from '@pact-foundation/pact';
const { like, regex } = Matchers;
// 1 Dog API Handler
import { dogApiHandler } from './dog-handler';

const path = require('path');
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

describe('Message consumer tests', () => {
  // 2 Pact Message Consumer
  const messagePact = new Pact({
    consumer: 'MyJSMessageConsumerV4',
    provider: 'MyJSMessageProviderV4',
    logLevel: LOG_LEVEL as LogLevel,
  });

  describe('receive dog event', () => {
    it('accepts a valid dog', () => {
      // 3 Consumer expectations
      return (
        messagePact
          .addAsynchronousInteraction()
          .given('a dog named drover')
          .expectsToReceive('a request for a dog', (builder: any) => {
            builder
              .withJSONContent({
                id: like(1),
                name: like('drover'),
                type: regex('^(bulldog|sheepdog)$', 'bulldog'),
              })
              .withMetadata({
                queue: 'animals',
              });
          })
          // 4 Verify consumers' ability to handle messages
          .executeTest(v4SynchronousBodyHandler(dogApiHandler))
      );
    });
  });

  // This is an example of a pact breaking
  // unskip to see how it works!
  it.skip('Does not accept an invalid dog', () => {
    return messagePact
      .addAsynchronousInteraction()
      .given('some state')
      .expectsToReceive('a request for a dog', (builder: any) => {
        builder
          .withJSONContent({
            name: like('fido'),
          })
          .withMetadata({
            queue: 'animals',
          });
      })
      .executeTest(v4SynchronousBodyHandler(dogApiHandler));
  });
});
