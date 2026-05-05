import express, { type Express } from 'express';

type Book = { id: number; title: string; author: string };

// In-memory catalogue, seeded by state handlers.
const catalogue: Book[] = [];

/**
 * Creates the Book Catalogue Service Express application.
 *
 * Returns XML from `GET /catalogue`. The XML structure must match what
 * `XmlBuilder` defined in the consumer test: a `<catalogue>` root element
 * with `<book>` children, each having an `id` attribute, a `<title>`, and
 * an `<author>`.
 */
export function createApp(): Express {
  const app = express();

  app.get('/catalogue', (_req, res) => {
    const booksXml = catalogue
      .map(
        (b) =>
          `  <book id="${b.id}"><title>${b.title}</title><author>${b.author}</author></book>`,
      )
      .join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<catalogue>\n${booksXml}\n</catalogue>`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  });

  return app;
}

/** Seed books. Called by state handlers before each verification run. */
export function seedBooks(books: Book[]): void {
  catalogue.length = 0;
  catalogue.push(...books);
}
