import type { InteractionFailure, VerificationResult } from './types';

/**
 * Thrown by {@link Verifier.verify} when the verification ran but failed.
 * Carries the complete structured result.
 *
 * The message names the failed interactions and the errors that belong to no
 * interaction (e.g. a pact that could not be loaded), so that the cause is
 * visible even when every listed interaction passed.
 */
export class ProviderVerificationError extends Error {
  readonly result: VerificationResult;

  constructor(result: VerificationResult) {
    super(describeFailedRun(result));
    this.name = 'ProviderVerificationError';
    this.result = result;
  }
}

function describeFailedRun(result: VerificationResult): string {
  const failed = result.interactions.filter((i) => !i.success && !i.pending);
  const unattributed = result.unattributedErrors ?? [];
  const lines = [
    `Provider verification failed for ${failed.length} of ${result.interactions.length} interaction(s)${failed.length > 0 ? ':' : '.'}`,
    ...failed.map((i) => `  - ${describeInteraction(i)}`),
  ];
  if (unattributed.length > 0) {
    lines.push(
      `${unattributed.length} error(s) not attributed to an interaction (e.g. a pact that could not be loaded):`,
      ...unattributed.map(
        (e) => `  - ${e.interaction}: ${summarizeFailure(e.failure)}`,
      ),
    );
  } else if (failed.length === 0) {
    lines.push(
      'The core reported a failed run without details; see result.output.',
    );
  }
  return lines.join('\n');
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

/** One line per mismatch, or the error message. */
export function formatFailure(failure: InteractionFailure | undefined): string {
  if (!failure) {
    return '  (no failure details reported by the core)';
  }
  if (failure.type === 'error') {
    return `  ${failure.message}`;
  }
  return failure.mismatches
    .map((m) => {
      const where = m.path ?? m.key ?? m.parameter;
      return `  - ${m.type}${where ? ` at ${where}` : ''}: ${m.mismatch}`;
    })
    .join('\n');
}

/** The error message, or the number of mismatches. */
export const summarizeFailure = (failure: InteractionFailure): string =>
  failure.type === 'error'
    ? failure.message
    : `${failure.mismatches.length} mismatch(es)`;
