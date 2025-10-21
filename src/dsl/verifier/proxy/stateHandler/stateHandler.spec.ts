import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import express from 'express';

import sinon from 'sinon';
import { createProxyStateHandler } from './stateHandler';
import { ProxyOptions, StateHandlers } from '../types';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('#createProxyStateHandler', () => {
  const state = {
    state: 'thing exists',
    action: 'setup',
  };

  let res: any;
  const mockResponse = {
    status: (status: number) => {
      res = status;
      return {
        send: () => {},
      };
    },
    json: (data: any) => data,
  };

  context('when valid state handlers are provided', () => {
    it('returns a 200', async () => {
      const stateHandlers = {
        'thing exists': () => Promise.resolve(),
      };

      const h = createProxyStateHandler({
        stateHandlers,
      } as ProxyOptions);
      return expect(
        h(
          {
            body: state,
          } as express.Request,
          mockResponse as express.Response
        )
      ).to.eventually.be.fulfilled;
    });
  });

  context('when there is a problem with a state handler', () => {
    const badStateHandlers: StateHandlers = {
      'thing exists': {
        setup: () => Promise.reject(new Error('bad')),
      },
    };

    it('returns a 200 and logs an error', async () => {
      const spy = sinon.spy(console, 'log');
      const h = createProxyStateHandler({
        stateHandlers: badStateHandlers,
      } as ProxyOptions);
      await h(
        {
          body: state,
        } as express.Request,
        mockResponse as express.Response
      );

      expect(res).to.eql(200);
      expect(spy.callCount).to.eql(3);
      expect(spy.getCall(0).args[0]).to.include(
        "Error executing state handler for state 'thing exists' on 'setup'."
      );
    });
  });
});
