/**
 * Structured result of a provider verification.
 *
 * The Rust core reports the verification as a JSON document (one entry per
 * verified interaction, plus the failures and the human readable output).
 * These types are the typed view of that document as returned by
 * {@link Verifier.verify}.
 *
 * @module ProviderVerifier
 */

/**
 * A single mismatch between the pact and the provider response, e.g. a wrong
 * status code or a body attribute of the wrong type.
 */
export interface VerificationMismatch {
  /** Mismatch kind as reported by the core, e.g. `StatusMismatch`, `BodyMismatch`, `HeaderMismatch` */
  type: string;
  /** Human readable description of the mismatch */
  mismatch: string;
  /** JSON path of the mismatching body element (body mismatches only) */
  path?: string;
  /** Header name or metadata key (header/metadata mismatches only) */
  key?: string;
  /** Query parameter name (query mismatches only) */
  parameter?: string;
  expected?: unknown;
  actual?: unknown;
}

/**
 * Why an interaction failed: either the response did not match, or the
 * verification itself could not be executed (e.g. the provider was not
 * reachable or a provider state handler failed).
 */
export type InteractionFailure =
  | {
      type: 'mismatches';
      mismatches: VerificationMismatch[];
      interactionId?: string;
    }
  | {
      type: 'error';
      message: string;
      interactionId?: string;
    };

/** Result of verifying one interaction of a pact. */
export interface InteractionVerificationResult {
  /**
   * Consumer of the pact the interaction belongs to. Only known when the
   * core reports it (pact-core >= 20.2.0), or for failed interactions of older
   * cores where it is recovered from the failure description.
   */
  consumer?: string;
  /** Provider of the pact the interaction belongs to. See {@link consumer}. */
  provider?: string;
  /** Interaction description from the pact file */
  description: string;
  /**
   * Names of the provider states of the interaction, in pact order. Only
   * known when the core reports it (pact-core >= 20.2.0); `undefined` otherwise.
   */
  providerStates?: string[];
  /** Whether the pact or the interaction is pending (failures do not fail the run) */
  pending: boolean;
  /** `true` when the interaction was verified successfully */
  success: boolean;
  /** Failure details, present when `success` is `false` */
  failure?: InteractionFailure;
  /** Duration of the verification as formatted by the core, e.g. `"12ms"` */
  duration?: string;
  /** Interaction ID, only set for pacts loaded from a Pact Broker */
  interactionId?: string;
  /** Interaction key, only set for V4 pacts that carry keys */
  interactionKey?: string;
}

/** A failure entry as listed in the `errors` / `pendingErrors` sections of the result. */
export interface VerificationFailureEntry {
  /**
   * Descriptive text of the failed verification, e.g.
   * `Verifying a pact between Consumer and Provider Given a state - description`
   */
  interaction: string;
  failure: InteractionFailure;
}

/** Complete result of a provider verification run. */
export interface VerificationResult {
  /** Overall pass/fail result */
  success: boolean;
  /** One entry per verified interaction, in verification order */
  interactions: InteractionVerificationResult[];
  /** Failures that fail the run */
  errors: VerificationFailureEntry[];
  /** Failures of pending pacts or interactions (do not fail the run) */
  pendingErrors: VerificationFailureEntry[];
  /** Notices provided by the Pact Broker */
  notices: Record<string, string>[];
  /** Human readable verification output, one entry per line (may contain ANSI colour codes) */
  output: string[];
  /** The raw JSON document as reported by the core */
  raw: unknown;
}

/** The interaction results of one pact (consumer/provider pair). */
export interface PactVerificationResult {
  consumer?: string;
  provider?: string;
  interactions: InteractionVerificationResult[];
}
