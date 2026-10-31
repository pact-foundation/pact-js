import { readFileSync } from 'node:fs';
import path from 'node:path';
import { groupByPact, parseVerificationResult } from './parse';

const fixture = (name: string): string =>
  readFileSync(
    path.resolve(__dirname, '..', '__fixtures__', `${name}.json`),
    'utf8',
  );

describe('parseVerificationResult', () => {
  describe('with the extended format (pact-core >= 20.2.0)', () => {
    it('parses a successful run with one entry per interaction', () => {
      const result = parseVerificationResult(
        fixture('verification-success.extended'),
      );

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.interactions).toHaveLength(5);
      expect(result.interactions[2]).toEqual({
        consumer: 'DemoConsumer',
        provider: 'DemoProvider',
        description: 'interaction 3 - GET /three',
        providerStates: ['resource three is available'],
        pending: false,
        success: true,
        duration: expect.any(String),
      });
      expect(result.interactions.map((i) => i.consumer)).toEqual([
        'DemoConsumer',
        'DemoConsumer',
        'DemoConsumer',
        'OtherConsumer',
        'OtherConsumer',
      ]);
      expect(result.output.length).toBeGreaterThan(0);
      expect(result.raw).toHaveProperty('result', true);
    });

    it('attaches the mismatches of a failed run to the interactions', () => {
      const result = parseVerificationResult(
        fixture('verification-failure.extended'),
      );

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3);
      const failed = result.interactions.filter((i) => !i.success);
      expect(failed.map((i) => i.description)).toEqual([
        'interaction 2 - GET /two',
        'interaction 3 - GET /three',
        'a request for two',
      ]);
      expect(failed[0].failure).toEqual({
        type: 'mismatches',
        mismatches: [
          expect.objectContaining({
            type: 'BodyMismatch',
            path: '$',
            mismatch: 'Actual map is missing the following keys: ok',
          }),
          expect.objectContaining({
            type: 'StatusMismatch',
            expected: 200,
            actual: 500,
          }),
        ],
      });
      expect(failed[1].providerStates).toEqual(['resource three is available']);
      expect(failed[2].consumer).toBe('OtherConsumer');
      expect(result.interactions[0].failure).toBeUndefined();
    });
  });

  describe('with the previous format (pact-core 19 and 20)', () => {
    it('parses a successful run without pact information', () => {
      const result = parseVerificationResult(fixture('verification-success'));

      expect(result.success).toBe(true);
      expect(result.interactions).toHaveLength(5);
      expect(result.interactions[0]).toEqual({
        description: 'interaction 1 - GET /one',
        pending: false,
        success: true,
        duration: expect.any(String),
      });
      expect(result.interactions[0].consumer).toBeUndefined();
      expect(result.interactions[0].providerStates).toBeUndefined();
    });

    it('recovers pact, provider states and mismatches of failed interactions from the errors list', () => {
      const result = parseVerificationResult(fixture('verification-failure'));

      expect(result.success).toBe(false);
      const [two, three, otherTwo] = result.interactions.filter(
        (i) => !i.success,
      );
      expect(two).toMatchObject({
        consumer: 'DemoConsumer',
        provider: 'DemoProvider',
        description: 'interaction 2 - GET /two',
        failure: {
          type: 'mismatches',
          mismatches: [
            expect.objectContaining({ type: 'BodyMismatch' }),
            expect.objectContaining({ type: 'StatusMismatch' }),
          ],
        },
      });
      expect(two.providerStates).toBeUndefined();
      expect(three).toMatchObject({
        consumer: 'DemoConsumer',
        provider: 'DemoProvider',
        providerStates: ['resource three is available'],
        failure: {
          type: 'mismatches',
          mismatches: [expect.objectContaining({ path: '$.ok' })],
        },
      });
      expect(otherTwo).toMatchObject({
        consumer: 'OtherConsumer',
        provider: 'DemoProvider',
        description: 'a request for two',
      });
      // successful interactions stay without pact information
      expect(result.interactions[0].consumer).toBeUndefined();
    });

    it('handles descriptions and states that contain the separators', () => {
      const result = parseVerificationResult({
        result: false,
        notices: [],
        output: [],
        pendingErrors: [],
        errors: [
          {
            interaction:
              'Verifying a pact between Consumer and Provider Given state - with dash And another - interaction - with dashes',
            mismatch: { type: 'error', message: 'boom', interactionId: '' },
          },
        ],
        interactionResults: [
          {
            description: 'interaction - with dashes',
            result: 'Error',
            duration: '1ms',
          },
        ],
      });

      expect(result.interactions[0]).toMatchObject({
        consumer: 'Consumer',
        provider: 'Provider',
        providerStates: ['state - with dash', 'another'],
        failure: { type: 'error', message: 'boom' },
      });
    });

    it('keeps the provider states when consumer and provider cannot be split', () => {
      const result = parseVerificationResult({
        result: false,
        notices: [],
        output: [],
        pendingErrors: [],
        errors: [
          {
            interaction:
              'Verifying a pact between SoleName Given a state - an interaction',
            mismatch: { type: 'error', message: 'boom', interactionId: '' },
          },
        ],
        interactionResults: [
          { description: 'an interaction', result: 'Error', duration: '1ms' },
        ],
      });

      expect(result.interactions[0]).toMatchObject({
        providerStates: ['a state'],
        failure: { type: 'error', message: 'boom' },
      });
      expect(result.interactions[0].consumer).toBeUndefined();
      expect(result.interactions[0].provider).toBeUndefined();
    });

    it('marks interactions found in pendingErrors as pending', () => {
      const result = parseVerificationResult({
        result: true,
        notices: [],
        output: [],
        errors: [],
        pendingErrors: [
          {
            interaction: 'Verifying a pact between C and P - pending one',
            mismatch: {
              type: 'mismatches',
              mismatches: [
                {
                  type: 'StatusMismatch',
                  expected: 200,
                  actual: 404,
                  mismatch: 'expected 200 but was 404',
                },
              ],
              interactionId: '',
            },
          },
        ],
        interactionResults: [
          { description: 'pending one', result: 'Error', duration: '1ms' },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.interactions[0]).toMatchObject({
        pending: true,
        success: false,
        failure: { type: 'mismatches' },
      });
    });

    it('assigns duplicate descriptions in order', () => {
      const result = parseVerificationResult({
        result: false,
        notices: [],
        output: [],
        pendingErrors: [],
        errors: [
          {
            interaction: 'Verifying a pact between A and P - same',
            mismatch: { type: 'error', message: 'first', interactionId: '' },
          },
          {
            interaction: 'Verifying a pact between B and P - same',
            mismatch: { type: 'error', message: 'second', interactionId: '' },
          },
        ],
        interactionResults: [
          { description: 'same', result: 'Error', duration: '1ms' },
          { description: 'same', result: 'Error', duration: '1ms' },
        ],
      });

      expect(result.interactions.map((i) => i.consumer)).toEqual(['A', 'B']);
      expect(
        result.interactions.map((i) =>
          i.failure?.type === 'error' ? i.failure.message : undefined,
        ),
      ).toEqual(['first', 'second']);
    });
  });

  describe('attributes that only appear in some runs', () => {
    const withInteraction = (
      interaction: Record<string, unknown>,
      extra: Record<string, unknown> = {},
    ) =>
      parseVerificationResult({
        result: true,
        notices: [],
        output: [],
        errors: [],
        pendingErrors: [],
        interactionResults: [interaction],
        ...extra,
      });

    it('passes through the broker interaction id and the V4 interaction key', () => {
      const result = withInteraction({
        consumer: 'C',
        provider: 'P',
        description: 'from the broker',
        providerStates: [],
        pending: false,
        result: 'OK',
        duration: '3ms',
        interactionId: '1234',
        interactionKey: 'abc-key',
      });

      expect(result.interactions[0]).toMatchObject({
        interactionId: '1234',
        interactionKey: 'abc-key',
      });
    });

    it('keeps the header key and the query parameter of a mismatch', () => {
      const result = withInteraction({
        consumer: 'C',
        provider: 'P',
        description: 'headers and query',
        providerStates: [],
        pending: false,
        result: 'Error',
        duration: '1ms',
        mismatch: {
          type: 'mismatches',
          interactionId: '',
          mismatches: [
            {
              type: 'HeaderMismatch',
              key: 'Content-Type',
              expected: 'application/json',
              actual: 'text/plain',
              mismatch: 'Expected header Content-Type to be application/json',
            },
            {
              type: 'QueryMismatch',
              parameter: 'page',
              expected: '1',
              actual: '2',
              mismatch: 'Expected query parameter page to be 1',
            },
          ],
        },
      });

      const failure = result.interactions[0].failure;
      expect(failure?.type).toBe('mismatches');
      expect(failure?.type === 'mismatches' && failure.mismatches).toEqual([
        expect.objectContaining({
          type: 'HeaderMismatch',
          key: 'Content-Type',
        }),
        expect.objectContaining({ type: 'QueryMismatch', parameter: 'page' }),
      ]);
    });

    it('keeps the notices of a broker run', () => {
      const result = withInteraction(
        {
          description: 'one',
          result: 'OK',
          duration: '1ms',
        },
        {
          notices: [
            { type: 'info', text: 'This pact is being verified because ...' },
          ],
        },
      );

      expect(result.notices).toEqual([
        { type: 'info', text: 'This pact is being verified because ...' },
      ]);
    });

    it('attaches a failure whose description does not follow the usual pattern', () => {
      const result = parseVerificationResult({
        result: false,
        notices: [],
        output: [],
        pendingErrors: [],
        errors: [
          {
            interaction: 'Failed to load pact - some interaction',
            mismatch: { type: 'error', message: 'boom', interactionId: '' },
          },
        ],
        interactionResults: [
          { description: 'some interaction', result: 'Error', duration: '1ms' },
        ],
      });

      expect(result.interactions[0].failure).toEqual({
        type: 'error',
        message: 'boom',
      });
      expect(result.interactions[0].consumer).toBeUndefined();
      expect(result.interactions[0].providerStates).toBeUndefined();
    });
  });

  describe('with invalid input', () => {
    it('rejects the legacy "finished: 0" output of pact-core < 19', () => {
      expect(() => parseVerificationResult('finished: 0')).toThrow(
        /pact-core >= 19/,
      );
    });

    it('rejects error messages that are not a result document', () => {
      expect(() =>
        parseVerificationResult('Provider verification hooks failed:\n  - x'),
      ).toThrow(/Not a verification result document/);
    });

    it('truncates long input in the error message', () => {
      const long = 'x'.repeat(500);

      const error = (() => {
        try {
          parseVerificationResult(long);
          return undefined;
        } catch (e) {
          return e as Error;
        }
      })();

      expect(error?.message).toContain('…');
      expect(error?.message.length).toBeLessThan(long.length);
    });

    it('tolerates a document whose output and notices have the wrong shape', () => {
      const result = parseVerificationResult({
        result: true,
        notices: 'not an array',
        output: ['line', 42],
        errors: undefined,
        pendingErrors: undefined,
        interactionResults: [
          { description: 'one', result: 'OK', duration: '1ms' },
        ],
      });

      expect(result.notices).toEqual([]);
      expect(result.output).toEqual([]);
      expect(result.errors).toEqual([]);
      expect(result.interactions).toHaveLength(1);
    });
  });
});

describe('groupByPact', () => {
  it('groups the interactions by consumer and provider in verification order', () => {
    const result = parseVerificationResult(
      fixture('verification-failure.extended'),
    );

    const groups = groupByPact(result);

    expect(
      groups.map((g) => [g.consumer, g.provider, g.interactions.length]),
    ).toEqual([
      ['DemoConsumer', 'DemoProvider', 3],
      ['OtherConsumer', 'DemoProvider', 2],
    ]);
  });

  it('collects interactions without pact information in one group', () => {
    const result = parseVerificationResult(fixture('verification-success'));

    const groups = groupByPact(result);

    expect(groups).toHaveLength(1);
    expect(groups[0].consumer).toBeUndefined();
    expect(groups[0].interactions).toHaveLength(5);
  });
});
