import { vi } from 'vitest';
import {
  createMissingStates,
  missingStatesMessage,
  reportMissingStates,
} from './missingStates';

describe('#missingStates', () => {
  let missingStates: Set<string>;

  beforeEach(() => {
    missingStates = createMissingStates();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#missingStatesMessage', () => {
    describe('when no states are missing', () => {
      it('returns an empty string', () => {
        expect(missingStatesMessage(missingStates)).toBe('');
      });
    });

    describe('when a state is missing', () => {
      it('returns a template for the missing state', () => {
        missingStates.add('thing exists');

        const message = missingStatesMessage(missingStates);

        expect(message).toContain(
          'Could not find one or more provider states.',
        );
        expect(message).toContain(
          'Have you required the provider states file for this consumer in your test?',
        );
        expect(message).toContain(
          'If you have not yet defined these states, here is a template to add to the Verifier constructor:',
        );
        expect(message).toContain("    'thing exists': () => {");
        expect(message).toContain('  stateHandlers: {');
        expect(message).toContain('    // ... any existing handlers');
      });
    });

    describe('when multiple states are missing', () => {
      it('templates each state once, in the order they were seen', () => {
        missingStates.add('thing exists');
        missingStates.add('another thing exists');
        missingStates.add('thing exists');

        const message = missingStatesMessage(missingStates);

        expect(message.match(/'thing exists':/g)).toHaveLength(1);
        expect(message.indexOf("'thing exists'")).toBeLessThan(
          message.indexOf("'another thing exists'"),
        );
      });
    });

    describe('when a state contains a quote', () => {
      it('escapes the quote so the template stays valid JavaScript', () => {
        missingStates.add("a user's thing exists");

        expect(missingStatesMessage(missingStates)).toContain(
          "    'a user\\'s thing exists': () => {",
        );
      });
    });
  });

  describe('#reportMissingStates', () => {
    describe('when no states are missing', () => {
      it('does not log anything', () => {
        const spy = vi.spyOn(console, 'log');

        reportMissingStates(missingStates);

        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('when states are missing', () => {
      it('logs the template', () => {
        const spy = vi.spyOn(console, 'log');
        missingStates.add('thing exists');

        reportMissingStates(missingStates);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.mock.calls[0][0]).toContain("    'thing exists': () => {");
      });
    });
  });
});
