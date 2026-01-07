/**
 * Pact Matching Rules Example
 *
 * This test suite demonstrates how to use Pact JS with matching rules,
 * which allow you to define flexible matching criteria for request and response attributes
 * beyond exact equality.
 *
 * Key concepts covered:
 * 1. Using withRequestMatchingRules to apply rules to consumer requests
 * 2. Using withResponseMatchingRules to apply rules to provider responses
 * 3. Type matching for flexible data validation
 * 4. Regex matching for pattern-based validation
 * 5. Number range matching for numerical constraints
 * 6. Combining multiple matching rules
 *
 * Matching rules follow the Pact specification format and allow testing
 * contracts without requiring exact string/number matches, making tests
 * more maintainable and resilient to changes.
 *
 * see https://docs.pact.io for more information on Pact
 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  SpecificationVersion,
  PactV3,
  MatchersV3,
} from '@pact-foundation/pact';
import axios from 'axios';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Pact Consumer Test Using Matching Rules', () => {
  /**
   * Initialize a new Pact instance with consumer and provider names.
   */
  const pact = new PactV3({
    consumer: 'matchingrulesconsumer',
    provider: 'matchingrulesprovider',
    logLevel: 'trace',
  });

  it('uses withRequestMatchingRules to validate request with type matching', async () => {
    // Define matching rules for the request
    // This example uses type matching to ensure the request body fields are of the correct type
    const requestMatchingRules = {
      body: {
        '$.customerId': {
          matchers: [{ match: 'type' }],
        },
        '$.email': {
          matchers: [{ match: 'type' }],
        },
      },
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
        JSON.stringify(requestMatchingRules)
      )
      .willRespondWith({
        status: 200,
        body: {
          success: MatchersV3.boolean(true),
          message: MatchersV3.like('Customer profile updated successfully'),
        },
      })
      .executeTest(async (mockServer) => {
        // Send request with different values but same types
        const response = await axios.put(
          `${mockServer.url}/customers/c789456`,
          {
            customerId: 892341, // Different customer ID, but still a number
            email: 'michael.chen@innovate.io', // Different email, but still a string
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
    // Define matching rules with regex patterns for email validation
    const requestMatchingRules = {
      body: {
        '$.email': {
          matchers: [
            {
              match: 'regex',
              regex: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
            },
          ],
        },
        '$.phone': {
          matchers: [
            {
              match: 'regex',
              regex: '^\\+?[1-9]\\d{1,14}$', // E.164 phone number format
            },
          ],
        },
      },
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
        JSON.stringify(requestMatchingRules)
      )
      .willRespondWith({
        status: 201,
        body: {
          id: MatchersV3.uuid('a3f2c8b1-9d4e-4c7a-b2e5-f8a9c1d3e5f7'),
          created: MatchersV3.boolean(true),
        },
      })
      .executeTest(async (mockServer) => {
        // Send request with different but valid email and phone
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
    // Define matching rules for the response to allow flexible values
    const responseMatchingRules = {
      body: {
        '$.timestamp': {
          matchers: [{ match: 'type' }],
        },
        '$.count': {
          matchers: [{ match: 'integer' }],
        },
        '$.products[*].sku': {
          matchers: [{ match: 'type' }],
        },
        '$.products[*].name': {
          matchers: [{ match: 'type' }],
        },
      },
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
        JSON.stringify(responseMatchingRules)
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

  it('uses withResponseMatchingRules with number range validation', async () => {
    // Define matching rules with number ranges
    const responseMatchingRules = {
      body: {
        '$.price': {
          matchers: [
            {
              match: 'decimal',
              min: 0.01,
              max: 9999.99,
            },
          ],
        },
        '$.stockLevel': {
          matchers: [
            {
              match: 'integer',
              min: 0,
              max: 1000,
            },
          ],
        },
      },
    };

    await pact
      .given('wireless headphones are in inventory')
      .uponReceiving('a request for product details with numeric range rules')
      .withRequest({
        method: 'GET',
        path: '/products/HEADPHONE-WH1000XM5',
        headers: {
          Accept: 'application/json',
        },
      })
      .withResponseMatchingRules(
        {
          method: 'GET',
          path: '/products/HEADPHONE-WH1000XM5',
        },
        JSON.stringify(responseMatchingRules)
      )
      .willRespondWith({
        status: 200,
        body: {
          sku: MatchersV3.like('HEADPHONE-WH1000XM5'),
          name: MatchersV3.like('Sony WH-1000XM5 Wireless Headphones'),
          price: 399.99,
          stockLevel: 47,
          available: MatchersV3.boolean(true),
        },
      })
      .executeTest(async (mockServer) => {
        const response = await axios.get(
          `${mockServer.url}/products/HEADPHONE-WH1000XM5`,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        );

        expect(response.status).to.eq(200);
        expect(response.data.price).to.be.a('number');
        expect(response.data.price).to.be.within(0.01, 9999.99);
        expect(response.data.stockLevel).to.be.a('number');
        expect(response.data.stockLevel).to.be.within(0, 1000);
      });
  });

  it('uses both request and response matching rules together', async () => {
    // Define matching rules for both request and response
    const requestMatchingRules = {
      body: {
        '$.orderId': {
          matchers: [
            {
              match: 'regex',
              regex: '^ORD-[0-9]{6}$',
            },
          ],
        },
        '$.amount': {
          matchers: [
            {
              match: 'decimal',
              min: 0.01,
            },
          ],
        },
      },
    };

    const responseMatchingRules = {
      body: {
        '$.transactionId': {
          matchers: [{ match: 'type' }],
        },
        '$.processedAt': {
          matchers: [
            {
              match: 'regex',
              regex: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}',
            },
          ],
        },
        '$.status': {
          matchers: [
            {
              match: 'regex',
              regex: '^(pending|approved|declined)$',
            },
          ],
        },
      },
    };

    await pact
      .given('Stripe payment gateway is operational')
      .uponReceiving(
        'a credit card payment request with combined matching rules'
      )
      .withRequestMatchingRules(
        {
          method: 'POST',
          path: '/payments',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer dummy_sk_test_4eC39HqLyjWDarjtT1zdp7dc',
          },
          body: {
            orderId: 'ORD-458923',
            amount: 1249.99,
          },
        },
        JSON.stringify(requestMatchingRules)
      )
      .withResponseMatchingRules(
        {
          method: 'POST',
          path: '/payments',
        },
        JSON.stringify(responseMatchingRules)
      )
      .willRespondWith({
        status: 200,
        body: {
          transactionId: 'TXN-pi_3QRtKL2eZvKYlo2C0v8fHw7d',
          processedAt: '2026-01-07T14:32:18Z',
          status: 'approved',
          message: MatchersV3.like('Payment authorized successfully'),
        },
      })
      .executeTest(async (mockServer) => {
        const response = await axios.post(
          `${mockServer.url}/payments`,
          {
            orderId: 'ORD-892347', // Different but valid format
            amount: 2799.5,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer dummy_sk_test_4eC39HqLyjWDarjtT1zdp7dc',
            },
          }
        );

        expect(response.status).to.eq(200);
        expect(response.data.transactionId).to.be.a('string');
        expect(response.data.processedAt).to.match(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
        );
        expect(response.data.status).to.match(/^(pending|approved|rejected)$/);
      });
  });

  it('uses matching rules with Map object instead of JSON string', async () => {
    // Create matching rules as a Map object
    const requestMatchingRules = new Map<string, unknown>();
    requestMatchingRules.set('body', {
      '$.username': {
        matchers: [
          {
            match: 'regex',
            regex: '^[a-zA-Z0-9_]{3,20}$',
          },
        ],
      },
    });

    const responseMatchingRules = new Map<string, unknown>();
    responseMatchingRules.set('body', {
      '$.userId': {
        matchers: [{ match: 'type' }],
      },
      '$.createdAt': {
        matchers: [{ match: 'type' }],
      },
    });

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
          username: MatchersV3.like('emily_rodriguez'),
          createdAt: 1736258400000,
        },
      })
      .executeTest(async (mockServer) => {
        const response = await axios.post(
          `${mockServer.url}/api/v1/register`,
          {
            username: 'alex_thompson', // Diffvops.cloud// Different but valid username
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
