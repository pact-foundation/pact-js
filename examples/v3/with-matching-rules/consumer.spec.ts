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
  integer,
  regex,
  boolean,
  uuid,
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
          rule: [like(789456)],
        },
        {
          path: '$.email',
          rule: [like('sarah.johnson@techcorp.com')],
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

  it('uses withRequestMatchingRules with regex pattern matching', async () => {
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
      .given('CRM system accepts new contacts')
      .uponReceiving(
        'a request to create a sales lead with validated contact info'
      )
      .withRequestMatchingRules(
        {
          method: 'POST',
          path: '/contacts',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            email: 'jessica.martinez@acmecorp.com',
            phone: '+14155552671',
          },
        },
        requestMatchingRules
      )
      .willRespondWith({
        status: 201,
        body: {
          id: uuid('a3f2c8b1-9d4e-4c7a-b2e5-f8a9c1d3e5f7'),
          created: boolean(true),
        },
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

  it('uses withResponseMatchingRules for flexible response validation', async () => {
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
      .given('electronics products are in stock')
      .uponReceiving(
        'a request for product catalog with response matching rules'
      )
      .withRequest({
        method: 'GET',
        path: '/catalog/electronics',
        headers: {
          Accept: 'application/json',
        },
      })
      .withResponseMatchingRules(
        {
          method: 'GET',
          path: '/catalog/electronics',
        },
        responseMatchingRules
      )
      .willRespondWith({
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          timestamp: 1736250000000,
          count: 3,
          products: [
            { sku: 'LAPTOP-MBP16-2026', name: 'MacBook Pro 16-inch M4' },
            { sku: 'PHONE-IP16-PRO', name: 'iPhone 16 Pro' },
            { sku: 'WATCH-AW10-GPS', name: 'Apple Watch Series 10' },
          ],
        },
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

  it('uses matching rules with Map object instead of JSON string', async () => {
    const requestMatchingRules: Rules = {
      body: [
        {
          path: '$.username',
          rule: [regex('^[a-zA-Z0-9_]{3,20}$', 'emily_rodriguez')],
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
      .given('SaaS platform user registration is enabled')
      .uponReceiving('a new account registration with Map-based matching rules')
      .withRequestMatchingRules(
        {
          method: 'POST',
          path: '/api/v1/register',
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            username: 'emily_rodriguez',
            email: 'emily.rodriguez@startup.ventures',
          },
        },
        requestMatchingRules
      )
      .withResponseMatchingRules(
        {
          method: 'POST',
          path: '/api/v1/register',
        },
        responseMatchingRules
      )
      .willRespondWith({
        status: 201,
        body: {
          userId: 987654,
          username: like('emily_rodriguez'),
          createdAt: 1736258400000,
        },
      })
      .executeTest(async (mockServer) => {
        const response = await axios.post(
          `${mockServer.url}/api/v1/register`,
          {
            username: 'alex_thompson',
            email: 'jane@example.com',
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
