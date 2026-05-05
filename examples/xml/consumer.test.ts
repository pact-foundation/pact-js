import path from 'node:path';
import {
  type LogLevel,
  Matchers,
  Pact,
  SpecificationVersion,
  XmlBuilder,
} from '@pact-foundation/pact';
import { describe, expect, it } from 'vitest';
import { CatalogueClient } from './consumer';

const { string } = Matchers;

/**
 * Consumer Pact tests for the XML Catalogue Service.
 *
 * XML matching uses `XmlBuilder` to describe the expected XML structure with
 * Pact matchers. `eachLike()` matches repeated elements; `string()` matchers
 * on `appendElement()` content assert that text content is a string (any value).
 * Attribute values are matched as plain strings.
 */
describe('CatalogueClient', () => {
  const pact = new Pact({
    consumer: 'CatalogueConsumer',
    provider: 'CatalogueService',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: (process.env.LOG_LEVEL as LogLevel) ?? 'warn',
  });

  it('fetches the book catalogue as XML', async () => {
    await pact
      .addInteraction()
      .given('the catalogue has books')
      .uponReceiving('a GET request for the catalogue in XML')
      .withRequest('GET', '/catalogue', (builder) => {
        builder.headers({ Accept: 'application/xml' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/xml; charset=utf-8' });
        // xmlBody() passes the XmlBuilder structure to Pact with content type
        // application/xml. XmlBuilder describes the expected XML shape using
        // Pact matchers:
        //   eachLike() — the catalogue must contain at least one <book> element.
        //   string()   — element text content must be a string (any value).
        // Attribute values are matched as plain strings.
        builder.xmlBody(
          new XmlBuilder('1.0', 'UTF-8', 'catalogue').build((catalogue) => {
            catalogue.eachLike('book', new Map([['id', '1']]), (book) => {
              book.appendElement(
                'title',
                new Map(),
                string('The Pragmatic Programmer'),
              );
              book.appendElement('author', new Map(), string('David Thomas'));
            });
          }),
        );
      })
      .executeTest(async (mockserver) => {
        const client = new CatalogueClient(mockserver.url);
        const catalogue = await client.getCatalogue();
        expect(catalogue.books.length).toBeGreaterThan(0);
        expect(typeof catalogue.books[0].title).toBe('string');
      });
  });
});
