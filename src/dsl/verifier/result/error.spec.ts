import { ProviderVerificationError } from './error';
import { parseVerificationResult } from './parse';

const resultWith = (interactions: Record<string, unknown>[]) =>
  parseVerificationResult({
    result: false,
    notices: [],
    output: [],
    errors: [],
    pendingErrors: [],
    interactionResults: interactions,
  });

describe('ProviderVerificationError', () => {
  it('names the failed interactions by pact and description', () => {
    const error = new ProviderVerificationError(
      resultWith([
        {
          consumer: 'C',
          provider: 'P',
          description: 'one',
          pending: false,
          result: 'Error',
          duration: '1ms',
        },
        {
          consumer: 'C',
          provider: 'P',
          description: 'two',
          pending: false,
          result: 'OK',
          duration: '1ms',
        },
      ]),
    );

    expect(error.name).toBe('ProviderVerificationError');
    expect(error.message).toContain('failed for 1 of 2 interaction(s)');
    expect(error.message).toContain('C -> P: one');
    expect(error.result.interactions).toHaveLength(2);
  });

  it('falls back to the bare description when the pact is unknown', () => {
    const error = new ProviderVerificationError(
      resultWith([{ description: 'one', result: 'Error', duration: '1ms' }]),
    );

    expect(error.message).toContain('- one');
    expect(error.message).not.toContain('->');
  });

  it('does not count pending interactions as failures', () => {
    const error = new ProviderVerificationError(
      resultWith([
        {
          consumer: 'C',
          provider: 'P',
          description: 'pending one',
          pending: true,
          result: 'Error',
          duration: '1ms',
        },
      ]),
    );

    expect(error.message).toContain('failed for 0 of 1 interaction(s)');
  });
});
