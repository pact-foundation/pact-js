import path from 'node:path';
import {
  type LogLevel,
  MessageProviderPact,
  providerWithMetadata,
} from '@pact-foundation/pact';
import { describe, it } from 'vitest';
import { createEvent } from './index';

const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

describe('Message provider tests', () => {
  const p = new MessageProviderPact({
    messageProviders: {
      'a request to save an event': providerWithMetadata(() => createEvent(), {
        'content-type': 'application/json',
      }),
    },
    logLevel: LOG_LEVEL as LogLevel,
    provider: 'SNSPactEventProvider',
    pactUrls: [
      path.resolve(
        __dirname,
        '..',
        'pacts',
        'SNSPactEventConsumer-SNSPactEventProvider.json',
      ),
    ],
  });

  describe('send an event', () => {
    it('sends a valid event', () => {
      return p.verify();
    });
  });
});
