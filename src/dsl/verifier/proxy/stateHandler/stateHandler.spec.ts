import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon, { SinonSpy } from 'sinon';

import express from 'express';

import { createProxyStateHandler } from './stateHandler';
import * as setupStatesModule from './setupStates';
import { ProxyOptions } from '../types';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('#createProxyStateHandler', () => {
  let res: any;
  const mockResponse = {
    status: (status: number) => {
      res = status;
      return {
        // eslint-disable-next-line no-empty-function
        send: () => {},
      };
    },
    json: (data: any) => data,
  };

  context('when valid state handlers are provided', () => {
    beforeEach(() => {
      sinon.stub(setupStatesModule, 'setupStates').returns(Promise.resolve({}));
    });
    afterEach(() => {
      (setupStatesModule.setupStates as SinonSpy).restore();
    });
    it('returns a 200', async () => {
      const h = createProxyStateHandler({} as ProxyOptions);
      const data = await h(
        {} as express.Request,
        mockResponse as express.Response
      );

      expect(data).to.deep.eq({});
    });
  });

  context('when there is a problem with a state handler', () => {
    beforeEach(() => {
      sinon
        .stub(setupStatesModule, 'setupStates')
        .returns(Promise.reject(new Error('state error')));
    });
    afterEach(() => {
      (setupStatesModule.setupStates as SinonSpy).restore();
    });
    it('returns a 500', async () => {
      const h = createProxyStateHandler({} as ProxyOptions);
      await h({} as express.Request, mockResponse as express.Response);

      expect(res).to.eql(500);
    });
  });
});
