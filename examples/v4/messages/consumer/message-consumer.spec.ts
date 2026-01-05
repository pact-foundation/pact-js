/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */

import {
  Matchers,
  v4SynchronousBodyHandler,
  LogLevel,
  Pact,
} from '@pact-foundation/pact';
const { like, regex, eachKeyMatches } = Matchers;
// 1 Dog API Handler
import { dogApiHandler, DogClassification } from './dog-handler';
import { AnyJson } from '@pact-foundation/pact/src/common/jsonTypes';

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
    it('accepts a valid dog', () => 
      // 3 Consumer expectations
       (
        messagePact
          .addAsynchronousInteraction()
          .given('a dog named drover')
          .expectsToReceive('a request for a dog', (builder) => {
              builder
          //             .jsonBody(
          //   Matchers.eachKeyMatches(
          //     {
          //       id: "1",
          //       classification: DogClassification.ThisFixedValue,
          //     },
          //     [Matchers.regex(/[a-z]{3,}[0-9]/, 'key1')]
          //   )
          // )
              .withJSONContent(
        {
          id: '1',
          classification: DogClassification.ThisFixedValue,
          ...Matchers.eachKeyMatches(
            {
              barIdentifier: 'foo',
            },
            [
              Matchers.regex(/fooIdentifier/, 'fooIdentifier'),
            ]
          ),
        },
              // Matchers.eachKeyMatches(
              // {
              //   id: "1",
              //   // classification: DogClassification.ThisFixedValue,
              //   // barIdentifier: "foo",
              //   // barVersion: 1

              // },
              // [
              //   Matchers.like("1"),
              //   // Matchers.like(DogClassification.ThisFixedValue),
              //   // Matchers.regex(/fooIdentifier/, 'fooIdentifier'),
              //   // Matchers.regex(/fooVersion/, 'fooVersion')
              // ]),
              // Matchers.eachKeyMatches(
              // {
              //   // id: "1",
              //   classification: DogClassification.ThisFixedValue,
              //   // barIdentifier: "foo",
              //   // barVersion: 1

              // },
              // [
              //   // Matchers.like("1"),
              //   Matchers.like(DogClassification.ThisFixedValue),
              //   // Matchers.regex(/fooIdentifier/, 'fooIdentifier'),
              //   // Matchers.regex(/fooVersion/, 'fooVersion')
              // ]),
              // Matchers.eachKeyMatches(
              // {
              //   // id: "1",
              //   // classification: DogClassification.ThisFixedValue,
              //   barIdentifier: "foo",
              //   // barVersion: 1

              // },
              // [
              //   // Matchers.like("1"),
              //   // Matchers.like(DogClassification.ThisFixedValue),
              //   Matchers.regex(/fooIdentifier/, 'fooIdentifier'),
              //   // Matchers.regex(/fooVersion/, 'fooVersion')
              // ]),
              // Matchers.eachKeyMatches(
              // {
              //   // id: "1",
              //   // classification: DogClassification.ThisFixedValue,
              //   // barIdentifier: "foo",
              //   barVersion: 1

              // },
              // [
              //   // Matchers.like("1"),
              //   // Matchers.like(DogClassification.ThisFixedValue),
              //   // Matchers.regex(/fooIdentifier/, 'fooIdentifier'),
              //   Matchers.regex(/fooVersion/, 'fooVersion')
              // ]),
              )
              .withMetadata({
                queue: 'animals',
              });
          })
          // 4 Verify consumers' ability to handle messages
          .executeTest(v4SynchronousBodyHandler((body: AnyJson) => dogApiHandler(body as any)))
      )
    );
  });

  // This is an example of a pact breaking
  // unskip to see how it works!
  it.skip('Does not accept an invalid dog', () => messagePact
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
      .executeTest(v4SynchronousBodyHandler((body: AnyJson) => dogApiHandler(body as any))));
});
