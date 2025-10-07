/* tslint:disable:no-unused-expression object-literal-sort-keys max-classes-per-file no-empty */
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import path = require('path');
import sinonChai from 'sinon-chai';
import { Pact, Interaction, Matchers, LogLevel } from '@pact-foundation/pact';

const expect = chai.expect;
import { DogService } from '../src/index';
const { eachLike } = Matchers;

chai.use(sinonChai);
chai.use(chaiAsPromised);
const LOG_LEVEL = process.env.LOG_LEVEL || 'TRACE';

describe('The Dog API', () => {
  const url = 'http://127.0.0.1';
  let dogService: DogService;

  const provider = new Pact({
    // port,
    log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
    dir: path.resolve(process.cwd(), 'pacts'),
    spec: 2,
    consumer: 'Typescript Consumer Example',
    provider: 'Typescript Provider Example',
    logLevel: LOG_LEVEL as LogLevel,
  });

  const dogExample = { dog: 1 };
  const EXPECTED_BODY = eachLike(dogExample);

  before(() =>
    provider.setup().then((opts) => {
      dogService = new DogService({ url, port: opts.port });
    })
  );

  after(() => provider.finalize());

  afterEach(() => provider.verify());

  describe('get /dogs using builder pattern', () => {
    before(() => {
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

      return provider.addInteraction(interaction);
    });

    it('returns the correct response', async () => {
      const res = await dogService.getMeDogs();
      expect(res.data[0]).to.deep.eq(dogExample);
    });
  });

  describe('get /dogs using object pattern', () => {
    before(() => {
      return provider.addInteraction({
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
    });

    it('returns the correct response', async () => {
      const res = await dogService.getMeDogs();
      expect(res.data[0]).to.deep.eq(dogExample);
    });
  });
});
