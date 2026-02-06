/**
 * Pact Matching Rules Example
 *
 * This test suite demonstrates how to use Pact JS with withRequestMatchingRules method using the builder pattern.
 *
 * see https://docs.pact.io for more information on Pact
 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  PactV3,
  like,
  boolean,
  Rules,
} from '@pact-foundation/pact';
import axios from 'axios';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Pact Consumer Test Using Matching Rules', () => {
  const pact = new PactV3({
    consumer: 'matchingrulesconsumer',
    provider: 'matchingrulesprovider',
    logLevel: 'trace',
  });

  it('uses withRequestMatchingRules to validate request with type matching', async () => {
    const requestMatchingRules: Rules = {
      body: [
        {
          path: '$.customerId',
          rules: [like(789456)],
        },
        {
          path: '$.email',
          rules: [like('sarah.johnson@techcorp.com')],
        },
      ],
    };

    await pact
      .given('a customer profile exists')
      .uponReceiving(
        'a request to update customer profile with type matching rules'
      )
      .withRequestMatchingRules(
        {
          method: 'PUT',
          path: '/customers/c789456',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            customerId: 789456,
            email: 'sarah.johnson@techcorp.com',
          },
        },
        requestMatchingRules
      )
      .willRespondWith({
        status: 200,
        body: {
          success: boolean(true),
          message: like('Customer profile updated successfully'),
        },
      })
      .executeTest(async (mockServer) => {
        const response = await axios.put(
          `${mockServer.url}/customers/c789456`,
          {
            customerId: 892341,
            email: 'michael.chen@innovate.io',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        expect(response.status).to.eq(200);
        expect(response.data.success).to.be.true;
      });
  });
});
