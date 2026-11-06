import type {
  InteractionFailure,
  InteractionVerificationResult,
  PactVerificationResult,
  VerificationFailureEntry,
  VerificationMismatch,
  VerificationResult,
} from './types';

type Json = Record<string, unknown>;

const isObject = (v: unknown): v is Json =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const asString = (v: unknown): string | undefined =>
  typeof v === 'string' ? v : undefined;

const asStringArray = (v: unknown): string[] | undefined =>
  Array.isArray(v) && v.every((s) => typeof s === 'string')
    ? (v as string[])
    : undefined;

/**
 * Parses the JSON document reported by the core into a {@link VerificationResult}.
 *
 * Supports both the extended format (pact-core >= 20.2.0 / pact_ffi >= 0.5.8,
 * interaction entries
 * carry `consumer`, `provider`, `providerStates`, `pending` and `mismatch`)
 * and the older format, where failures are only listed in `errors` and are
 * joined to their interaction via the failure description.
 *
 * @param raw the JSON string as returned by pact-core (resolved value on
 *            success, `Error.message` on failure), or the already parsed object
 * @throws Error if the input is not a verification result document
 */
export function parseVerificationResult(
  raw: string | unknown,
): VerificationResult {
  const json = typeof raw === 'string' ? tryParseJson(raw) : raw;
  if (
    !isObject(json) ||
    typeof json.result !== 'boolean' ||
    !Array.isArray(json.interactionResults)
  ) {
    throw new Error(
      `Not a verification result document. This needs @pact-foundation/pact-core >= 19. Received: ${truncate(String(typeof raw === 'string' ? raw : JSON.stringify(raw)))}`,
    );
  }

  const errors = parseFailureEntries(json.errors);
  const pendingErrors = parseFailureEntries(json.pendingErrors);
  const unmatchedErrors = [...errors];
  const unmatchedPendingErrors = [...pendingErrors];

  const interactions = (json.interactionResults as unknown[])
    .filter(isObject)
    .map((entry): InteractionVerificationResult => {
      const description = asString(entry.description) ?? '';
      const success = entry.result === 'OK';
      const interaction: InteractionVerificationResult = {
        consumer: asString(entry.consumer),
        provider: asString(entry.provider),
        description,
        providerStates: asStringArray(entry.providerStates),
        pending: entry.pending === true,
        success,
        duration: asString(entry.duration),
        interactionId: asString(entry.interactionId),
        interactionKey: asString(entry.interactionKey),
      };
      if (isObject(entry.mismatch)) {
        interaction.failure = parseFailure(entry.mismatch);
      }
      if (!success && !interaction.failure) {
        // Older cores: recover the failure (and the pact) from the errors list.
        const match =
          takeMatchingFailure(unmatchedErrors, description) ??
          takeMatchingFailure(unmatchedPendingErrors, description, () => {
            interaction.pending = true;
          });
        if (match) {
          interaction.failure = match.entry.failure;
          interaction.consumer ??= match.consumer;
          interaction.provider ??= match.provider;
          interaction.providerStates ??= match.providerStates;
        }
      }
      return stripUndefined(interaction);
    });

  return {
    success: json.result as boolean,
    interactions,
    errors,
    pendingErrors,
    notices: Array.isArray(json.notices)
      ? (json.notices.filter(isObject) as Record<string, string>[])
      : [],
    output: asStringArray(json.output) ?? [],
    raw: json,
  };
}

/**
 * Groups interaction results by pact (consumer/provider pair), preserving the
 * verification order. Interactions whose pact is unknown are grouped together
 * under `consumer`/`provider` `undefined`.
 */
export function groupByPact(
  result: Pick<VerificationResult, 'interactions'>,
): PactVerificationResult[] {
  const groups: PactVerificationResult[] = [];
  for (const interaction of result.interactions) {
    let group = groups.find(
      (g) =>
        g.consumer === interaction.consumer &&
        g.provider === interaction.provider,
    );
    if (!group) {
      group = {
        consumer: interaction.consumer,
        provider: interaction.provider,
        interactions: [],
      };
      groups.push(group);
    }
    group.interactions.push(interaction);
  }
  return groups;
}

const tryParseJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
};

const truncate = (s: string, max = 200): string =>
  s.length > max ? `${s.slice(0, max)}…` : s;

const parseFailureEntries = (v: unknown): VerificationFailureEntry[] =>
  Array.isArray(v)
    ? v.filter(isObject).map((e) => ({
        interaction: asString(e.interaction) ?? '',
        failure: parseFailure(isObject(e.mismatch) ? e.mismatch : {}),
      }))
    : [];

const parseFailure = (m: Json): InteractionFailure => {
  const interactionId = asString(m.interactionId) || undefined;
  if (m.type === 'error') {
    return {
      type: 'error',
      message: asString(m.message) ?? 'unknown error',
      interactionId,
    };
  }
  const mismatches = Array.isArray(m.mismatches)
    ? m.mismatches.filter(isObject).map(parseMismatch)
    : [];
  return { type: 'mismatches', mismatches, interactionId };
};

const parseMismatch = (m: Json): VerificationMismatch =>
  stripUndefined({
    type: asString(m.type) ?? 'Mismatch',
    mismatch: asString(m.mismatch) ?? '',
    path: asString(m.path),
    key: asString(m.key),
    parameter: asString(m.parameter),
    expected: m.expected,
    actual: m.actual,
  });

const FAILURE_KEY_PREFIX = 'Verifying a pact between ';

type FailureMatch = {
  entry: VerificationFailureEntry;
  consumer?: string;
  provider?: string;
  providerStates?: string[];
};

/**
 * Finds (and removes) the first failure entry that belongs to the interaction
 * with the given description. The failure description has the form
 * `Verifying a pact between <consumer> and <provider>[ Given <state>[ And <state>]*] - <description>`.
 */
function takeMatchingFailure(
  entries: VerificationFailureEntry[],
  description: string,
  onMatch?: () => void,
): FailureMatch | undefined {
  const suffix = ` - ${description}`;
  const index = entries.findIndex((e) => e.interaction.endsWith(suffix));
  if (index < 0) {
    return undefined;
  }
  const [entry] = entries.splice(index, 1);
  onMatch?.();
  const prefix = entry.interaction.slice(0, -suffix.length);
  if (!prefix.startsWith(FAILURE_KEY_PREFIX)) {
    return { entry };
  }
  const pactAndStates = prefix.slice(FAILURE_KEY_PREFIX.length);
  const [pactPart, ...stateParts] = pactAndStates.split(' Given ');
  const providerStates =
    stateParts.length > 0
      ? stateParts.join(' Given ').split(' And ')
      : undefined;
  const separator = pactPart.lastIndexOf(' and ');
  if (separator < 0) {
    return { entry, providerStates };
  }
  return {
    entry,
    consumer: pactPart.slice(0, separator),
    provider: pactPart.slice(separator + ' and '.length),
    providerStates,
  };
}

function stripUndefined<T extends object>(o: T): T {
  for (const key of Object.keys(o) as (keyof T)[]) {
    if (o[key] === undefined) {
      delete o[key];
    }
  }
  return o;
}
