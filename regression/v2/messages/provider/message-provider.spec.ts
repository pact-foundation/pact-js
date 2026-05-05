/*  tslint:disable: no-console*/

import * as path from 'node:path';
import {
  type LogLevel,
  MessageProviderPact,
  providerWithMetadata,
} from '@pact-foundation/pact';
import { describe, it } from 'vitest';
import { createDog } from './dog-client';

const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

describe('Message provider tests', () => {
  const p = new MessageProviderPact({
    messageProviders: {
      'a request for a dog': providerWithMetadata(() => createDog(27), {
        queue: 'animals',
      }),
    },
    stateHandlers: {
      'some state': () => {
        console.log('State handler: setting up "some state" for interaction');
        return Promise.resolve(`state set to create a dog`);
      },
    },
    logLevel: LOG_LEVEL as LogLevel,
    pactUrls: [
      path.resolve(
        __dirname,
        '..',
        'pacts',
        'MyJSMessageConsumer-MyJSMessageProvider.json',
      ),
    ],
  });

  describe('send a dog event', () => {
    it('sends a valid dog', () => {
      return p.verify();
    });
  });
});
