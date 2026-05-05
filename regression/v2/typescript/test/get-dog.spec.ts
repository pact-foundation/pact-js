/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */

import * as path from 'node:path';
import {
  Interaction,
  type LogLevel,
  MatchersV2 as Matchers,
  PactV2 as Pact,
} from '@pact-foundation/pact';
import { describe, expect, it } from 'vitest';

import { DogService } from '../src/index';

const { eachLike } = Matchers;
const LOG_LEVEL = process.env.LOG_LEVEL || 'WARN';

describe('The Dog API', () => {
  const url = 'http://127.0.0.1';
  const dogExample = { dog: 1 };
  const EXPECTED_BODY = eachLike(dogExample);

  const makeProvider = () =>
    new Pact({
      log: path.resolve(__dirname, '..', 'logs', 'mockserver-integration.log'),
      dir: path.resolve(__dirname, '..', 'pacts'),
      spec: 2,
      consumer: 'Typescript Consumer Example',
      provider: 'Typescript Provider Example',
      logLevel: LOG_LEVEL as LogLevel,
    });

  it('get /dogs using builder pattern', async () => {
    const provider = makeProvider();
    const opts = await provider.setup();
    const dogService = new DogService({ url, port: opts.port });

    const interaction = new Interaction()
      .given('I have a list of dogs')
      .uponReceiving('a request for all dogs with the builder pattern')
      .withRequest({
        method: 'GET',
        path: '/dogs',
        headers: {
          Accept: 'application/json',
        },
      })
      .willRespondWith({
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: EXPECTED_BODY,
      });

    await provider.addInteraction(interaction);
    const res = await dogService.getMeDogs();
    expect(res.data[0]).toEqual(dogExample);

    await provider.verify();
    await provider.finalize();
  });

  it('get /dogs using object pattern', async () => {
    const provider = makeProvider();
    const opts = await provider.setup();
    const dogService = new DogService({ url, port: opts.port });

    await provider.addInteraction({
      state: 'i have a list of dogs',
      uponReceiving: 'a request for all dogs with the object pattern',
      withRequest: {
        method: 'GET',
        path: '/dogs',
        headers: {
          Accept: 'application/json',
        },
      },
      willRespondWith: {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: EXPECTED_BODY,
      },
    });
    const res = await dogService.getMeDogs();
    expect(res.data[0]).toEqual(dogExample);

    await provider.verify();
    await provider.finalize();
  });
});
