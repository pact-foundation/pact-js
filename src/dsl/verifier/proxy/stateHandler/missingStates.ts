/**
 * Tracks the provider states that were requested during verification but had no
 * matching handler registered, so they can be reported as a single, copy/paste
 * friendly template once verification completes.
 *
 * This mirrors the behaviour of the other Pact implementations, which print the
 * states they were unable to find when a verification fails.
 */

export type MissingStates = Set<string>;

export const createMissingStates = (): MissingStates => new Set<string>();

const stateHandlerTemplate = (state: string): string =>
  [
    `    '${state.replace(/'/g, "\\'")}': () => {`,
    '        // do the thing',
    '    },',
  ].join('\n');

export const missingStatesMessage = (missingStates: MissingStates): string => {
  if (missingStates.size === 0) {
    return '';
  }

  const template = [...missingStates].map(stateHandlerTemplate).join('\n');

  return [
    '',
    'Could not find one or more provider states.',
    'Have you required the provider states file for this consumer in your test?',
    '',
    'If you have not yet defined these states, here is a template to add to the Verifier constructor:',
    '',
    '  stateHandlers: {',
    template,
    '    // ... any existing handlers',
    '  }',
    '',
  ].join('\n');
};

export const reportMissingStates = (missingStates: MissingStates): void => {
  const message = missingStatesMessage(missingStates);

  if (message !== '') {
    console.log(message);
  }
};
