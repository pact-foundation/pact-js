import axios, { type AxiosResponse } from 'axios';
import { XMLParser } from 'fast-xml-parser';

/** A book parsed from an XML catalogue response. */
export interface Book {
  id: number;
  title: string;
  author: string;
}

/** Parsed catalogue response. */
export interface Catalogue {
  books: Book[];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

/**
 * HTTP client for the Book Catalogue Service.
 *
 * Fetches a list of books as XML and parses it into plain objects.
 * XML is common in legacy systems, document-centric APIs, and industry
 * standards (SOAP, Atom, RSS). Pact's XmlBuilder lets you define XML
 * response contracts with the same matcher flexibility as JSON.
 */
export class CatalogueClient {
  constructor(private readonly baseUrl: string) {}

  /**
   * Fetch the book catalogue as XML.
   *
   * The response is `Content-Type: application/xml` and contains a
   * `<catalogue>` root element with one or more `<book>` children.
   */
  async getCatalogue(): Promise<Catalogue> {
    const { data }: AxiosResponse<string> = await axios.get(
      `${this.baseUrl}/catalogue`,
      { headers: { Accept: 'application/xml' }, responseType: 'text' },
    );
    const parsed = parser.parse(data) as {
      catalogue: { book: Array<{ id: number; title: string; author: string }> };
    };
    return { books: [parsed.catalogue.book].flat() };
  }
}
