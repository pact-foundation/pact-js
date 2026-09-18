import type { VerificationResult } from './types';

/**
 * Thrown by {@link Verifier.verify} when the verification ran but at least
 * one interaction failed. Carries the complete structured result.
 */
export class ProviderVerificationError extends Error {
  readonly result: VerificationResult;

  constructor(result: VerificationResult) {
    const failed = result.interactions.filter((i) => !i.success && !i.pending);
    const names = failed.map((i) => `  - ${describeInteraction(i)}`).join('\n');
    super(
      `Provider verification failed for ${failed.length} of ${result.interactions.length} interaction(s):\n${names}`,
    );
    this.name = 'ProviderVerificationError';
    this.result = result;
  }
}

/** `Consumer -> Provider: description` (or just the description when the pact is unknown). */
export const describeInteraction = (i: {
  consumer?: string;
  provider?: string;
  description: string;
}): string =>
  i.consumer && i.provider
    ? `${i.consumer} -> ${i.provider}: ${i.description}`
    : i.description;
