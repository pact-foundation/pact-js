import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readPactFile, readPactFiles } from './pactFiles';

const pactDir = path.resolve(__dirname, '..', '__fixtures__', 'pact-files');

const tmpDirs: string[] = [];
/** A fresh empty directory, removed again after the suite. */
const tmp = (): string => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pact-js-spec-'));
  tmpDirs.push(dir);
  return dir;
};

afterAll(() => {
  for (const dir of tmpDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

/** The message of the error a call throws, or '' when it does not throw. */
const messageOf = (fn: () => unknown): string => {
  try {
    fn();
    return '';
  } catch (e) {
    return (e as Error).message;
  }
};

describe('readPactFiles', () => {
  it('reads all pact files of a directory in name order', () => {
    const pacts = readPactFiles([pactDir]);

    expect(pacts.map((p) => `${p.consumer} -> ${p.provider}`)).toEqual([
      'DemoConsumer -> DemoProvider',
      'OtherConsumer -> DemoProvider',
      'MessageConsumer -> Provider',
      'V2Consumer -> Provider',
      'V4Consumer -> Provider',
    ]);
    expect(pacts[3].file).toBe(path.join(pactDir, 'v2-consumer-provider.json'));
  });

  it('reads single files', () => {
    const pacts = readPactFiles([
      path.join(pactDir, 'v2-consumer-provider.json'),
      path.join(pactDir, 'v4-consumer-provider.json'),
    ]);

    expect(pacts.map((p) => p.consumer)).toEqual(['V2Consumer', 'V4Consumer']);
  });

  it('rejects remote sources', () => {
    expect(() =>
      readPactFiles(['http://broker.example.com/pacts/provider/p/consumer/c']),
    ).toThrow(/only local pact files or directories/);
  });

  it('rejects files that are not pacts', () => {
    expect(() =>
      readPactFile(
        path.resolve(
          __dirname,
          '..',
          '__fixtures__',
          'verification-success.json',
        ),
      ),
    ).toThrow(/not a pact file/);
  });

  it('reports a source that does not exist, naming the path', () => {
    const message = messageOf(() => readPactFiles(['./no/such/directory']));

    expect(message).toContain('Cannot read the pact source');
    expect(message).toContain('./no/such/directory');
  });

  it('returns nothing for a directory without pact files', () => {
    expect(readPactFiles([tmp()])).toEqual([]);
  });

  it('takes only the pacts of the given provider from a directory, like the core', () => {
    const pacts = readPactFiles([pactDir], { provider: 'Provider' });

    expect(pacts.map((p) => p.consumer)).toEqual([
      'MessageConsumer',
      'V2Consumer',
      'V4Consumer',
    ]);
  });

  it('takes a pact given as a file regardless of its provider, like the core', () => {
    const pacts = readPactFiles(
      [path.join(pactDir, 'v2-consumer-provider.json')],
      { provider: 'DemoProvider' },
    );

    expect(pacts.map((p) => p.consumer)).toEqual(['V2Consumer']);
  });

  it('applies the consumer filters to every source', () => {
    const pacts = readPactFiles(
      [pactDir, path.join(pactDir, 'v2-consumer-provider.json')],
      { consumers: ['OtherConsumer', 'V4Consumer'] },
    );

    expect(pacts.map((p) => p.consumer)).toEqual([
      'OtherConsumer',
      'V4Consumer',
    ]);
  });

  it('does not descend into subdirectories and ignores files that are not .json, like the core', () => {
    const dir = tmp();
    mkdirSync(path.join(dir, 'nested'));
    writeFileSync(
      path.join(dir, 'nested', 'nested.json'),
      JSON.stringify({ consumer: { name: 'Nested' }, provider: { name: 'P' } }),
    );
    writeFileSync(path.join(dir, 'README.md'), 'not a pact');
    writeFileSync(
      path.join(dir, 'top.json'),
      JSON.stringify({ consumer: { name: 'Top' }, provider: { name: 'P' } }),
    );

    expect(readPactFiles([dir]).map((p) => p.consumer)).toEqual(['Top']);
  });
});

describe('readPactFile', () => {
  it('reports invalid JSON, naming the file', () => {
    const file = path.join(tmp(), 'broken.json');
    writeFileSync(file, '{ not json');

    // The file path is matched as a substring: on Windows it contains
    // backslashes, which would be escape sequences in a regular expression.
    const message = messageOf(() => readPactFile(file));

    expect(message).toContain('Cannot read the pact file');
    expect(message).toContain(file);
  });

  it('accepts provider states given as plain strings and skips nameless ones', () => {
    const file = path.join(tmp(), 'states.json');
    writeFileSync(
      file,
      JSON.stringify({
        consumer: { name: 'C' },
        provider: { name: 'P' },
        interactions: [
          {
            description: 'mixed states',
            providerStates: ['plain state', { name: 'named state' }, {}],
          },
        ],
      }),
    );

    expect(readPactFile(file).interactions[0].providerStates).toEqual([
      'plain state',
      'named state',
    ]);
  });

  it('reads a pact without interactions', () => {
    const file = path.join(tmp(), 'empty.json');
    writeFileSync(
      file,
      JSON.stringify({ consumer: { name: 'C' }, provider: { name: 'P' } }),
    );

    expect(readPactFile(file)).toMatchObject({
      consumer: 'C',
      provider: 'P',
      interactions: [],
    });
  });
});

describe('readPactFile', () => {
  it('maps V2 provider states', () => {
    const pact = readPactFile(path.join(pactDir, 'v2-consumer-provider.json'));

    expect(pact.interactions).toEqual([
      {
        description: 'a request without state',
        providerStates: [],
      },
      {
        description: 'a request with a state',
        providerStates: ['there is a thing'],
      },
    ]);
  });

  it('maps V4 provider states and keys', () => {
    const pact = readPactFile(path.join(pactDir, 'v4-consumer-provider.json'));

    expect(pact.interactions).toEqual([
      {
        description: 'a request with two states',
        providerStates: ['state one', 'state two'],
        key: 'abc123',
      },
      { description: 'a pending request', providerStates: [] },
      { description: 'a pending request', providerStates: [] },
    ]);
  });

  it('reads the messages of a V3 message pact', () => {
    const pact = readPactFile(
      path.join(pactDir, 'message-consumer-provider.json'),
    );

    expect(pact.interactions).toEqual([
      {
        description: 'an order created event',
        providerStates: ['an order exists'],
      },
    ]);
  });
});
