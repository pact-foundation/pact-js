/**
 * Pact V4 Matching Rules Example
 *
 * This test suite demonstrates how to use Pact JS V4 with matching rules,
 * using the builder pattern to apply flexible matching criteria for request
 * and response attributes.
 *
 * Key concepts covered:
 * 1. Using builder.matchingRules() to apply rules to requests
 * 2. Using builder.matchingRules() to apply rules to responses
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
import { Pact, Matchers } from '@pact-foundation/pact';
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
    // Define matching rules for the request
    const requestMatchingRules = new Map<string, any>(Object.entries({
      body: {
        '$.customerId': {
          matchers: [{ match: 'type' }],
        },
        '$.email': {
          matchers: [{ match: 'type' }],
        },
      },
    }));

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

  it('uses request matching rules with regex pattern matching for CRM contacts', async () => {
    // Define matching rules with regex patterns
    const requestMatchingRules = new Map<string, any>(Object.entries({
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
    }));

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

  it('uses response matching rules for flexible product catalog validation', async () => {
    // Define matching rules for the response
    const responseMatchingRules = new Map<string, any>(Object.entries({
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
    }));

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

  it('uses response matching rules with number range validation for e-commerce', async () => {
    // Define matching rules with number ranges
    const responseMatchingRules = new Map<string, any>(Object.entries({
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
    }));

    await pact
      .addInteraction()
      .given('wireless headphones are in inventory')
      .uponReceiving('a request for product details with numeric range rules')
      .withRequest('GET', '/products/HEADPHONE-WH1000XM5', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder
          .jsonBody({
            sku: Matchers.like('HEADPHONE-WH1000XM5'),
            name: Matchers.like('Sony WH-1000XM5 Wireless Headphones'),
            price: 399.99,
            stockLevel: 47,
            available: Matchers.boolean(true),
          })
          .matchingRules(responseMatchingRules);
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

  it('uses both request and response matching rules for payment processing', async () => {
    // Define matching rules for both request and response
    const requestMatchingRules = new Map<string, any>(Object.entries({
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
    }));

    const responseMatchingRules = new Map<string, any>(Object.entries({
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
    }));

    await pact
      .addInteraction()
      .given('Stripe payment gateway is operational')
      .uponReceiving(
        'a credit card payment request with combined matching rules'
      )
      .withRequest('POST', '/payments', (builder) => {
        builder
          .headers({
            'Content-Type': 'application/json',
            Authorization: 'Bearer dummy_sk_test_4eC39HqLyjWDarjtT1zdp7dc',
          })
          .jsonBody({
            orderId: 'ORD-458923',
            amount: 1249.99,
          })
          .matchingRules(requestMatchingRules);
      })
      .willRespondWith(200, (builder) => {
        builder
          .jsonBody({
            transactionId: 'TXN-pi_3QRtKL2eZvKYlo2C0v8fHw7d',
            processedAt: '2026-01-07T14:32:18Z',
            status: 'approved',
            message: Matchers.like('Payment authorized successfully'),
          })
          .matchingRules(responseMatchingRules);
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
        expect(response.data.status).to.match(/^(pending|approved|declined)$/);
      });
  });

  it('uses matching rules with Map object for SaaS platform registration', async () => {
    // Create matching rules as Map objects
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
      '$.email': {
        matchers: [{ match: 'type' }],
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
            username: 'alex_thompson', // Different but valid username
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
