/**
 * Pact V4 Matching Rules Example
 *
 * This test suite demonstrates how to use Pact JS V4 with matchingRules function
 * using the builder pattern.
 *
 * see https://docs.pact.io for more information on Pact
 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Pact, Matchers, Rules } from '@pact-foundation/pact';
import axios from 'axios';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Pact V4 Consumer Test Using Matching Rules', () => {
  /**
   * Initialize a new Pact V4 instance with consumer and provider names.
   */
  const pact = new Pact({
    consumer: 'v4matchingrulesconsumer',
    provider: 'v4matchingrulesprovider',
    logLevel: 'trace',
  });

  it('uses request matching rules with type matching for customer profile updates', async () => {
    const requestMatchingRules: Rules = {
      body: [
        {
          path: '$.customerId',
          rules: [Matchers.like(789456)],
        },
        {
          path: '$.email',
          rules: [Matchers.like('sarah.johnson@techcorp.com')],
        },
      ],
    };

    await pact
      .addInteraction()
      .given('a customer profile exists')
      .uponReceiving('a request to update customer profile with type matching')
      .withRequest('PUT', '/customers/c789456', (builder) => {
        builder
          .headers({ 'Content-Type': 'application/json' })
          .jsonBody({
            customerId: 789456,
            email: 'sarah.johnson@techcorp.com',
          })
          .matchingRules(requestMatchingRules);
      })
      .willRespondWith(200, (builder) => {
        builder.jsonBody({
          success: Matchers.boolean(true),
          message: Matchers.like('Customer profile updated successfully'),
        });
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
