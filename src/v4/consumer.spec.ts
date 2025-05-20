import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { LogLevel } from '@pact-foundation/pact-core';
import axios from 'axios';
import { SpecificationVersion, MatchersV3 } from '../v3';
import { PactV4 } from '.';

chai.use(chaiAsPromised);

const { expect } = chai;

process.env.ENABLE_FEATURE_V4 = 'true';

describe('V4ConsumerPact', () => {
  const pact = new PactV4({
    consumer: 'mymessageconsumer',
    provider: 'mymessageprovider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    logLevel: (process.env.LOG_LEVEL as LogLevel) || 'trace',
  });

  describe('httpInteraction', () => {
    it('passes', async () => {
      await pact
        .addInteraction()
        .uponReceiving('a request only checks the keys and ignores the values')
        .withRequest('GET', '/')
        .willRespondWith(200, (builder) => {
          builder.jsonBody({
            key1: MatchersV3.string("a string we don't care about"),
            key2: 1,
          });
        })
        .executeTest((mockserver) =>
          axios
            .request({
              baseURL: mockserver.url,
              method: 'GET',
              url: '/',
            })
            .then((res) => {
              expect(res.data.key1).to.equal("a string we don't care about");
              expect(res.data.key2).to.equal(1);
            })
        );
    });
  });

  describe('synchronousMessageInteraction', () => {
    it('passes', async () => {
      await pact
        .addSynchronousInteraction('a synchronous message')
        .given('a test')
        .withRequest((builder) => {
          builder.withJSONContent({
            key1: MatchersV3.string('request string'),
            key2: 1,
          });
        })
        .withResponse((builder) => {
          builder.withJSONContent({
            key1: MatchersV3.string('response string'),
            key2: 1,
          });
        })
        .executeTest(async () => {});
    });
  });

  describe('asynchronousMessageInteraction', () => {
    it('passes', () => {
      pact
        .addAsynchronousInteraction('an asynchronous message')
        .given('a test')
        .expectsToReceive('an asynchronous message')
        .withContents({
          messageId: '1234',
          messageBody: {
            value: 'expected',
          },
        })
        .executeTest(async (message) => {
          expect(message).to.deep.equal({
            messageId: '1234',
            messageBody: {
              value: 'expected',
            },
          });
        });
    });
  });
});
