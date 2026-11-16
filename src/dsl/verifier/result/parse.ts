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
 * interaction entries carry `consumer`, `provider`, `providerStates`,
 * `pending` and `mismatch`) and the older format, where failures are only
 * listed in `errors` and are joined to their interaction via the failure
 * description.
 *
 * Every entry of `errors` / `pendingErrors` is attributed to the interaction
 * it belongs to; the entries that belong to no listed interaction (e.g. a pact
 * that could not be loaded) end up in {@link VerificationResult.unattributedErrors}.
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
  const openErrors = [...errors];
  const openPendingErrors = [...pendingErrors];

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
        // The core lists the same failure in `errors` / `pendingErrors`. Take
        // it out so that only the failures without an interaction remain.
        takeFailureEntry(openErrors, interaction) ??
          takeFailureEntry(openPendingErrors, interaction);
      } else if (!success) {
        // Older cores: recover the failure (and the pact) from the errors list.
        const match =
          takeFailureEntry(openErrors, interaction) ??
          takeFailureEntry(openPendingErrors, interaction, () => {
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
    unattributedErrors: openErrors,
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

/**
 * The text the core uses for a failure of the given interaction:
 * `Verifying a pact between <consumer> and <provider>[ Given <state>[ And <state>]*] - <description>`.
 */
export const failureKey = (i: {
  consumer: string;
  provider: string;
  providerStates: string[];
  description: string;
}): string =>
  `${FAILURE_KEY_PREFIX}${i.consumer} and ${i.provider}${
    i.providerStates.length > 0
      ? ` Given ${i.providerStates.join(' And ')}`
      : ''
  } - ${i.description}`;

type FailureMatch = {
  entry: VerificationFailureEntry;
  consumer?: string;
  provider?: string;
  providerStates?: string[];
};

/**
 * Finds (and removes) the failure entry that belongs to the interaction.
 *
 * When the interaction's pact and provider states are known (extended format)
 * the complete failure text is compared. Otherwise the entry has to end with
 * ` - <description>`; among several such entries the one whose remaining text
 * has the plain `Verifying a pact between <consumer> and <provider>[ Given ...]`
 * shape wins, so that `get user` does not take the entry of `admin - get user`.
 */
function takeFailureEntry(
  entries: VerificationFailureEntry[],
  interaction: Pick<
    InteractionVerificationResult,
    'consumer' | 'provider' | 'providerStates' | 'description'
  >,
  onMatch?: () => void,
): FailureMatch | undefined {
  const { consumer, provider, providerStates, description } = interaction;
  if (consumer !== undefined && provider !== undefined) {
    const expected = failureKey({
      consumer,
      provider,
      providerStates: providerStates ?? [],
      description,
    });
    const index = entries.findIndex((e) => e.interaction === expected);
    if (index >= 0) {
      const [entry] = entries.splice(index, 1);
      onMatch?.();
      return { entry, consumer, provider, providerStates };
    }
  }

  const suffix = ` - ${description}`;
  const candidates = entries
    .map((entry, index) => ({ entry, index }))
    .filter(({ entry }) => entry.interaction.endsWith(suffix));
  if (candidates.length === 0) {
    return undefined;
  }
  const prefixOf = (text: string) => text.slice(0, -suffix.length);
  const plain = candidates.find(({ entry }) => {
    const prefix = prefixOf(entry.interaction);
    return (
      prefix.startsWith(FAILURE_KEY_PREFIX) &&
      !prefix.slice(FAILURE_KEY_PREFIX.length).includes(' - ')
    );
  });
  const { entry, index } = plain ?? candidates[0];
  entries.splice(index, 1);
  onMatch?.();

  const prefix = prefixOf(entry.interaction);
  if (!prefix.startsWith(FAILURE_KEY_PREFIX)) {
    return { entry };
  }
  const pactAndStates = prefix.slice(FAILURE_KEY_PREFIX.length);
  const [pactPart, ...stateParts] = pactAndStates.split(' Given ');
  const states =
    stateParts.length > 0
      ? stateParts.join(' Given ').split(' And ')
      : undefined;
  // The names themselves may contain " and "; without further information the
  // last occurrence is the best guess. Cores >= 20.2.0 report consumer and
  // provider explicitly, so this only affects older cores.
  const separator = pactPart.lastIndexOf(' and ');
  if (separator < 0) {
    return { entry, providerStates: states };
  }
  return {
    entry,
    consumer: pactPart.slice(0, separator),
    provider: pactPart.slice(separator + ' and '.length),
    providerStates: states,
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
