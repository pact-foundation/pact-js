import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import ConfigurationError from '../../../errors/configurationError';

/** An interaction as declared in a pact file. */
export interface PactFileInteraction {
  description: string;
  /** Provider state names in pact order (empty when there are none) */
  providerStates: string[];
  /** V4 pending flag */
  pending: boolean;
  /** V4 interaction key, if present */
  key?: string;
}

/** The parts of a pact file needed to enumerate its interactions. */
export interface PactFileSummary {
  file: string;
  consumer: string;
  provider: string;
  interactions: PactFileInteraction[];
}

const isLocalPath = (source: string): boolean =>
  !/^[a-z][a-z0-9+.-]*:\/\//i.test(source);

/**
 * Reads the pact files behind the given sources. Sources may be pact files or
 * directories containing pact files. Remote sources (URLs) cannot be read
 * synchronously and are rejected.
 */
export function readPactFiles(sources: string[]): PactFileSummary[] {
  return sources.flatMap((source) => {
    if (!isLocalPath(source)) {
      throw new ConfigurationError(
        `Cannot enumerate the interactions of '${source}': only local pact files or directories are supported, not URLs or broker sources`,
      );
    }
    const resolved = path.resolve(source);
    let isDirectory: boolean;
    try {
      isDirectory = statSync(resolved).isDirectory();
    } catch (e) {
      throw new ConfigurationError(
        `Cannot read the pact source '${source}' (resolved to '${resolved}'): ${reason(e)}`,
      );
    }
    const files = isDirectory
      ? readdirSync(resolved)
          .filter((f) => f.endsWith('.json'))
          .sort()
          .map((f) => path.join(resolved, f))
      : [resolved];
    return files.map(readPactFile);
  });
}

export function readPactFile(file: string): PactFileSummary {
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
  } catch (e) {
    throw new ConfigurationError(
      `Cannot read the pact file '${file}': ${reason(e)}`,
    );
  }
  const consumer = participantName(json.consumer);
  const provider = participantName(json.provider);
  if (!consumer || !provider) {
    throw new ConfigurationError(
      `'${file}' is not a pact file: consumer or provider name is missing`,
    );
  }
  // V2/V3/V4 HTTP pacts use `interactions`, V3 message pacts use `messages`.
  const entries = [
    ...(Array.isArray(json.interactions) ? json.interactions : []),
    ...(Array.isArray(json.messages) ? json.messages : []),
  ] as Record<string, unknown>[];
  return {
    file,
    consumer,
    provider,
    interactions: entries.map((i) => ({
      description: String(i.description ?? ''),
      providerStates: providerStateNames(i),
      pending: i.pending === true,
      key: typeof i.key === 'string' ? i.key : undefined,
    })),
  };
}

const reason = (e: unknown): string =>
  e instanceof Error ? e.message : String(e);

const participantName = (v: unknown): string | undefined =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as Record<string, unknown>).name === 'string'
    ? ((v as Record<string, unknown>).name as string)
    : undefined;

function providerStateNames(interaction: Record<string, unknown>): string[] {
  const states = interaction.providerStates;
  if (Array.isArray(states)) {
    return states
      .map((s) =>
        typeof s === 'string'
          ? s
          : typeof s === 'object' && s !== null
            ? String((s as Record<string, unknown>).name ?? '')
            : '',
      )
      .filter((s) => s.length > 0);
  }
  // V2 pacts: a single `providerState` string
  const state = interaction.providerState;
  return typeof state === 'string' && state.length > 0 ? [state] : [];
}
