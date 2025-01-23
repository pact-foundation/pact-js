/* tslint:disable:no-unused-expression no-empty */
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  SpecificationVersion,
  PactV4,
  LogLevel,
  MatchersV3,
} from '@pact-foundation/pact';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';

chai.use(chaiAsPromised);

const { expect } = chai;

process.env.ENABLE_FEATURE_V4 = 'true';

describe('V4 Matchers', () => {
  const pact = new PactV4({
    consumer: 'myconsumer',
    provider: 'myprovider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    logLevel: (process.env.LOG_LEVEL as LogLevel) || 'trace',
  });
  describe('eachKeyMatches', () => {
    it('returns the shape of object given to the matcher', async () => {
      await pact
        .addInteraction()
        .uponReceiving('a request only checks the keys and ignores the values')
        .withRequest('GET', '/eachKeyMatches', (builder) => {
          builder.query({ from: 'today' });
          builder.headers({ Accept: 'application/json' });
        })
        .willRespondWith(200, (builder) => {
          builder.jsonBody(
            MatchersV3.eachKeyMatches(
              {
                key1: "a string we don't care about",
                key2: 1,
              },
              [MatchersV3.regex(/[a-z]{3,}[0-9]/, 'key1')]
            )
          );
        })
        .executeTest((mockserver) => {
          return axios
            .request({
              baseURL: mockserver.url,
              method: 'GET',
              url: '/eachKeyMatches?from=today',
              headers: {
                Accept: 'application/json',
              },
            })
            .then((res) => {
              expect(res.data.key1).to.equal("a string we don't care about");
              expect(res.data.key2).to.equal(1);
            });
        });
    });
  });

  describe('eachValueMatches', () => {
    it('returns the shape of object given to the matcher', async () => {
      await pact
        .addInteraction()
        .uponReceiving(
          'a request that ignores the keys and only checks the values'
        )
        .withRequest('GET', '/eachValueMatches')
        .willRespondWith(200, (builder) => {
          builder.jsonBody(
            MatchersV3.eachValueMatches(
              {
                key1: 'a string',
                key2: 'this is another string',
                key3: 'this, unbelievably, is YET ANOTHER, string',
              },
              [MatchersV3.regex(/[a-z\s]+/, 'a string')]
            )
          );
        })
        .executeTest((mockserver) => {
          return axios
            .request({
              baseURL: mockserver.url,
              method: 'GET',
              url: '/eachValueMatches',
            })
            .then((res) => {
              expect(res.data.key1).to.equal('a string');
              expect(res.data.key2).to.equal('this is another string');
              expect(res.data.key3).to.equal(
                'this, unbelievably, is YET ANOTHER, string'
              );
            });
        });
    });
  });
});

describe.only('Multipart Request', () => {
  const form = new FormData();
  const f: string = path.resolve(__dirname, './../../../README.md');
  form.append('file.txt', fs.createReadStream(f));
  const formHeaders = form.getHeaders();

  const pact = new PactV4({
    consumer: 'multipartconsumer',
    provider: 'multipartprovider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    logLevel: (process.env.LOG_LEVEL as LogLevel) || 'trace',
  });

  it.only('matches the request', async () => {
    await pact
      .addInteraction()
      .uponReceiving('a multipart request')
      .withRequest('POST', '/multipart', (builder) => {
        builder.multipartBody('text/plain', f, 'file.txt');
      })
      .willRespondWith(200)
      .executeTest((mockserver) => {
        return axios
          .request({
            baseURL: mockserver.url,
            headers: {
              Accept: 'application/json',
              ...formHeaders,
            },
            data: form,
            method: 'POST',
            url: '/multipart',
          })
          .then((res) => {
            console.log(res.status);
          });
      });
  });
});
