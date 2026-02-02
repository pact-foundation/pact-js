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
import {
  Pact,
  Matchers,
  like,
  integer,
  regex,
  Rules,
} from '@pact-foundation/pact';
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
          rule: [like(789456)],
        },
        {
          path: '$.email',
          rule: [like('sarah.johnson@techcorp.com')],
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

  it('uses request matching rules with regex pattern matching for CRM contacts', async () => {
    const requestMatchingRules: Rules = {
      body: [
        {
          path: '$.email',
          rule: [
            regex(
              '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
              'jessica.martinez@acmecorp.com'
            ),
          ],
        },
        {
          path: '$.phone',
          rule: [regex('^\\+?[1-9]\\d{1,14}$', '+14155552671')],
        },
      ],
    };

    await pact
      .addInteraction()
      .given('CRM system accepts new contacts')
      .uponReceiving(
        'a request to create a sales lead with validated contact info'
      )
      .withRequest('POST', '/contacts', (builder) => {
        builder
          .headers({ 'Content-Type': 'application/json' })
          .jsonBody({
            email: 'jessica.martinez@acmecorp.com',
            phone: '+14155552671',
          })
          .matchingRules(requestMatchingRules);
      })
      .willRespondWith(201, (builder) => {
        builder.jsonBody({
          id: Matchers.uuid('a3f2c8b1-9d4e-4c7a-b2e5-f8a9c1d3e5f7'),
          created: Matchers.boolean(true),
        });
      })
      .executeTest(async (mockServer) => {
        const response = await axios.post(
          `${mockServer.url}/contacts`,
          {
            email: 'david.kim@globaltech.io',
            phone: '+442071838750',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        expect(response.status).to.eq(201);
        expect(response.data.created).to.be.true;
        expect(response.data.id).to.be.a('string');
      });
  });

  it('uses response matching rules for flexible product catalog validation', async () => {
    const responseMatchingRules: Rules = {
      body: [
        {
          path: '$.timestamp',
          rule: [like(1736250000000)],
        },
        {
          path: '$.count',
          rule: [integer(3)],
        },
        {
          path: '$.products[*].sku',
          rule: [like('LAPTOP-MBP16-2026')],
        },
        {
          path: '$.products[*].name',
          rule: [like('MacBook Pro 16-inch M4')],
        },
      ],
    };

    await pact
      .addInteraction()
      .given('electronics products are in stock')
      .uponReceiving(
        'a request for product catalog with response matching rules'
      )
      .withRequest('GET', '/catalog/electronics', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder
          .headers({ 'Content-Type': 'application/json' })
          .jsonBody({
            timestamp: 1736250000000,
            count: 3,
            products: [
              { sku: 'LAPTOP-MBP16-2026', name: 'MacBook Pro 16-inch M4' },
              { sku: 'PHONE-IP16-PRO', name: 'iPhone 16 Pro' },
              { sku: 'WATCH-AW10-GPS', name: 'Apple Watch Series 10' },
            ],
          })
          .matchingRules(responseMatchingRules);
      })
      .executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/catalog/electronics`,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        );

        expect(response.status).to.eq(200);
        expect(response.data.timestamp).to.be.a('number');
        expect(response.data.count).to.be.a('number');
        expect(response.data.products).to.be.an('array');
        expect(response.data.products).to.have.lengthOf(3);
      });
  });

  it('uses matching rules with Map object for SaaS platform registration', async () => {
    const requestMatchingRules: Rules = {
      body: [
        {
          path: '$.username',
          rule: [regex('^[a-zA-Z0-9_]{3,20}$', 'emily_rodriguez')],
        },
        {
          path: '$.email',
          rule: [like('emily.rodriguez@startup.ventures')],
        },
      ],
    };

    const responseMatchingRules: Rules = {
      body: [
        {
          path: '$.userId',
          rule: [like(987654)],
        },
        {
          path: '$.createdAt',
          rule: [like(1736258400000)],
        },
      ],
    };

    await pact
      .addInteraction()
      .given('SaaS platform user registration is enabled')
      .uponReceiving('a new account registration with Map-based matching rules')
      .withRequest('POST', '/api/v1/register', (builder) => {
        builder
          .headers({ 'Content-Type': 'application/json' })
          .jsonBody({
            username: 'emily_rodriguez',
            email: 'emily.rodriguez@startup.ventures',
          })
          .matchingRules(requestMatchingRules);
      })
      .willRespondWith(201, (builder) => {
        builder
          .jsonBody({
            userId: 987654,
            username: Matchers.like('emily_rodriguez'),
            createdAt: 1736258400000,
          })
          .matchingRules(responseMatchingRules);
      })
      .executeTest(async (mockServer) => {
        const response = await axios.post(
          `${mockServer.url}/api/v1/register`,
          {
            username: 'alex_thompson',
            email: 'alex.thompson@devops.cloud',
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        expect(response.status).to.eq(201);
        expect(response.data.userId).to.be.a('number');
        expect(response.data.username).to.be.a('string');
        expect(response.data.createdAt).to.be.a('number');
      });
  });
});
