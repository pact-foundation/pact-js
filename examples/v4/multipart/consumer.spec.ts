/* tslint:disable:no-unused-expression no-empty */
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { SpecificationVersion, Pact, LogLevel } from '@pact-foundation/pact';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import FormData from 'form-data';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Multipart Request', () => {
  describe('POST /upload', () => {
    const pact = new Pact({
      consumer: 'multipartconsumer',
      provider: 'multipartprovider',
      spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
      logLevel: (process.env.LOG_LEVEL as LogLevel) || 'debug',
    });

    it('matches the request', async () => {
      const form = new FormData();
      const f: string = path.resolve(__dirname, './../../../README.md');
      form.append('file.txt', fs.createReadStream(f));
      const formHeaders = form.getHeaders();

      await pact
        .addInteraction()
        .uponReceiving('a multipart request')
        .withRequest('POST', '/multipart', (builder) => {
          builder.multipartBody('text/plain', f, 'file.txt');
        })
        .willRespondWith(200)
        .executeTest((mockserver) => {
          return axios.request({
            baseURL: mockserver.url,
            headers: {
              Accept: 'application/json',
              ...formHeaders,
            },
            data: form,
            method: 'POST',
            url: '/multipart',
          });
        });
    });
  });
});
