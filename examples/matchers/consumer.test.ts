import path from 'node:path';
import {
  type LogLevel,
  Matchers,
  Pact,
  SpecificationVersion,
} from '@pact-foundation/pact';
import { describe, expect, it } from 'vitest';
import { ProductApiClient } from './consumer';

const {
  integer,
  decimal,
  string,
  regex,
  datetime,
  eachLike,
  eachKeyMatches,
  matchStatus,
  HTTPResponseStatusClass,
} = Matchers;

/**
 * Consumer tests demonstrating Pact's full matcher library.
 *
 * The key insight: matchers decouple the contract from specific values.
 * The provider in this example intentionally returns DIFFERENT values than
 * the consumer's examples — and all tests still pass, proving that the
 * contract is about structure and types, not the exact data.
 */
describe('ProductApiClient — matchers showcase', () => {
  const pact = new Pact({
    consumer: 'MatchersConsumer',
    provider: 'MatchersProvider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
  });

  it('fetches a product — like(), integer(), decimal(), string(), regex(), datetime(), eachLike()', async () => {
    await pact
      .addInteraction()
      .given('a product exists')
      .uponReceiving('a GET request for a product')
      .withRequest('GET', '/products/1', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({
          // integer(): must be a JSON integer, not a float or string
          id: integer(1),
          // string(): must be a string — any string
          name: string('Widget'),
          // decimal(): must be a decimal number (float)
          price: decimal(9.99),
          // regex(): must be a string matching this pattern
          category: regex(/^[a-z-]+$/, 'electronics'),
          // datetime(): must be a string matching the given format
          createdAt: datetime(
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            '2024-01-01T00:00:00.000Z',
          ),
          // eachLike(): array where every element matches the given shape
          tags: eachLike('featured'),
        });
      })
      .executeTest(async (mockserver) => {
        const client = new ProductApiClient(mockserver.url);
        const product = await client.getProduct(1);
        expect(typeof product.id).toBe('number');
        expect(typeof product.name).toBe('string');
        expect(product.tags.length).toBeGreaterThan(0);
      });
  });

  it('fetches all products — eachLike() on array response', async () => {
    await pact
      .addInteraction()
      .given('products exist')
      .uponReceiving('a GET request for all products')
      .withRequest('GET', '/products', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        // eachLike() on the top-level body: the response is an array where
        // every element matches { id: integer, name: string, price: decimal }.
        // The provider can return 1, 100, or 1000 elements — only the shape matters.
        builder.jsonBody(
          eachLike({
            id: integer(1),
            name: string('Widget'),
            price: decimal(9.99),
          }),
        );
      })
      .executeTest(async (mockserver) => {
        const client = new ProductApiClient(mockserver.url);
        const products = await client.getProducts();
        expect(products.length).toBeGreaterThan(0);
        expect(typeof products[0].name).toBe('string');
      });
  });

  it('fetches the catalog — eachKeyMatches() for dictionary responses', async () => {
    await pact
      .addInteraction()
      .given('the catalog is populated')
      .uponReceiving('a GET request for the product catalog')
      .withRequest('GET', '/catalog', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        // eachKeyMatches(): every key in the response object must match the
        // regex, and every value must match the given shape. Use this when
        // the response is a map/dictionary with dynamic or unknown keys.
        builder.jsonBody(
          eachKeyMatches(
            {
              'WIDGET-001': { name: string('Widget'), price: decimal(9.99) },
            },
            [regex(/^[A-Z]+-\d{3}$/, 'WIDGET-001')],
          ),
        );
      })
      .executeTest(async (mockserver) => {
        const client = new ProductApiClient(mockserver.url);
        const catalog = await client.getCatalog();
        expect(Object.keys(catalog).length).toBeGreaterThan(0);
      });
  });

  it('fetches products with flexible status code — matchStatus() for status code matching', async () => {
    await pact
      .addInteraction()
      .given('products exist')
      .uponReceiving(
        'a GET request for all products with flexible status matching',
      )
      .withRequest('GET', '/products', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      // matchStatus(): allows the provider to return any 2XX success status code
      // (200, 201, 202, etc.) instead of requiring an exact match. The example
      // value (200) is used in the consumer test, but the provider can return
      // any status in the Success class (2XX range).
      .willRespondWith(
        matchStatus(200, HTTPResponseStatusClass.Success),
        (builder) => {
          builder.headers({ 'Content-Type': 'application/json' });
          builder.jsonBody(
            eachLike({
              id: integer(1),
              name: string('Widget'),
              price: decimal(9.99),
            }),
          );
        },
      )
      .executeTest(async (mockserver) => {
        const client = new ProductApiClient(mockserver.url);
        const products = await client.getProducts();
        expect(products.length).toBeGreaterThan(0);
        expect(typeof products[0].name).toBe('string');
      });
  });
});
