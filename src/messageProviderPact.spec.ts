/* tslint:disable:no-unused-expression no-empty */
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import express from 'express';
import * as http from 'http';
import { Message } from './dsl/message';
import {
  MessageProviderPact,
  setupProxyServer,
  waitForServerReady,
} from './messageProviderPact';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const { expect } = chai;

describe('MesageProvider', () => {
  let provider: MessageProviderPact;
  const successfulRequest = 'successfulRequest';
  const unsuccessfulRequest = 'unsuccessfulRequest';

  const successfulMessage: Message = {
    contents: { foo: 'bar' },
    description: successfulRequest,
    providerStates: [{ name: 'some state' }],
  };

  const unsuccessfulMessage: Message = {
    contents: { foo: 'bar' },
    description: unsuccessfulRequest,
    providerStates: [{ name: 'some state not found' }],
  };
  const nonExistentMessage: Message = {
    contents: { foo: 'bar' },
    description: 'does not exist',
    providerStates: [{ name: 'some state not found' }],
  };

  beforeEach(() => {
    provider = new MessageProviderPact({
      logLevel: 'error',
      messageProviders: {
        successfulRequest: () => Promise.resolve('yay'),
        unsuccessfulRequest: () => Promise.reject(new Error('nay')),
      },
      provider: 'myprovider',
      stateHandlers: {
        'some state': () => Promise.resolve('yay'),
        'some state with params': (name, params) =>
          Promise.resolve(`name: ${name}, params: ${JSON.stringify(params)}`),
      },
    });
  });

  describe('#constructor', () => {
    it('creates a Provider when all mandatory parameters are provided', () => {
      expect(provider).to.be.a('object');
      expect(provider).to.respondTo('verify');
    });
    it('creates a Provider with default log level if not specified', () => {
      provider = new MessageProviderPact({
        messageProviders: {},
        provider: 'myprovider',
      });
      expect(provider).to.be.a('object');
      expect(provider).to.respondTo('verify');
    });
  });

  describe('#setupVerificationHandler', () => {
    describe('when their is a valid setup', () => {
      it('creates a valid express handler', (done) => {
        const setupVerificationHandler = (
          provider as any
        ).setupVerificationHandler.bind(provider)();
        const req = { body: successfulMessage };
        const res = {
          json: () => done(), // Expect a response
        };

        setupVerificationHandler(req, res);
      });
    });
    describe('when their is an invalid setup', () => {
      it('creates a valid express handler that rejects the message', (done) => {
        const setupVerificationHandler = (
          provider as any
        ).setupVerificationHandler.bind(provider)();
        const req = { body: nonExistentMessage };
        const res = {
          status: (status: number) => {
            expect(status).to.eq(500);

            return {
              send: () => done(), // Expect the status to be called with 500
            };
          },
        };

        setupVerificationHandler(req, res);
      });
    });
  });

  describe('#findHandler', () => {
    describe('when given a handler that exists', () => {
      it('returns a Handler object', () => {
        const findHandler = (provider as any).findHandler.bind(provider);
        return expect(findHandler(successfulMessage)).to.eventually.be.a(
          'function'
        );
      });
    });
    describe('when given a handler that does not exist', () => {
      it('returns a failed promise', () => {
        const findHandler = (provider as any).findHandler.bind(provider);
        return expect(findHandler('doesnotexist')).to.eventually.be.rejected;
      });
    });
  });

  describe('#setupStates', () => {
    describe('when given a handler that exists', () => {
      it('returns values of all resolved handlers', () => {
        const setupStates = (provider as any).setupStates.bind(provider);
        return expect(setupStates(successfulMessage)).to.eventually.deep.equal([
          'yay',
        ]);
      });
      it('passes params to the handler', () => {
        const setupStates = (provider as any).setupStates.bind(provider);
        return expect(
          setupStates({
            providerStates: [
              { name: 'some state with params', params: { foo: 'bar' } },
            ],
          })
        ).to.eventually.deep.equal([
          'name: some state with params, params: {"foo":"bar"}',
        ]);
      });
    });
    describe('when given a state that does not have a handler', () => {
      it('returns an empty promise', () => {
        provider = new MessageProviderPact({
          messageProviders: {},
          provider: 'myprovider',
        });
        const findStateHandler = (provider as any).setupStates.bind(provider);
        return expect(
          findStateHandler(unsuccessfulMessage)
        ).to.eventually.deep.equal([]);
      });
    });
  });

  describe('#waitForServerReady', () => {
    describe('when the http server starts up', () => {
      it('returns a resolved promise', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function, no-empty-function
        const server = http.createServer(() => {}).listen();

        return expect(waitForServerReady(server)).to.eventually.be.fulfilled;
      });
    });
  });
  describe('#setupProxyServer', () => {
    describe('when the http server starts up', () => {
      it('returns a resolved promise', () => {
        const app = express();

        expect(setupProxyServer(app)).to.be.an.instanceOf(http.Server);
      });
    });
  });
  describe('#setupProxyApplication', () => {
    it('returns a valid express app', () => {
      const setupProxyApplication = (
        provider as any
      ).setupProxyApplication.bind(provider);
      expect(setupProxyApplication().listen).to.be.a('function');
    });
  });
});
