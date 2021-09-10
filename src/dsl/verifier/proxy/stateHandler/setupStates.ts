import logger from '../../../../common/logger';
import {
  ProxyOptions,
  StateFunc,
  StateFuncWithSetup,
  ProviderState,
  StateHandler,
} from '../types';
import { JsonMap } from '../../../../common/jsonTypes';

const isStateFuncWithSetup = (
  fn: StateFuncWithSetup | StateFunc
): fn is StateFuncWithSetup =>
  (fn as StateFuncWithSetup).setup !== undefined ||
  (fn as StateFuncWithSetup).teardown !== undefined;

// Transform a regular state function to one with the setup/teardown functions
const transformStateFunc = (fn: StateHandler): StateFuncWithSetup =>
  isStateFuncWithSetup(fn) ? fn : { setup: fn };

// Lookup the handler based on the description
export const setupStates = (
  state: ProviderState,
  config: ProxyOptions
): Promise<JsonMap | void> => {
  logger.debug(`setting up state '${JSON.stringify(state)}'`);

  const handler = config.stateHandlers
    ? config.stateHandlers[state.state]
    : null;

  if (!handler) {
    if (state.action === 'setup') {
      logger.warn(`no state handler found for state: "${state.state}"`);
    }
    return Promise.resolve();
  }

  const stateFn = transformStateFunc(handler);
  switch (state.action) {
    case 'setup':
      if (stateFn.setup) {
        logger.debug(`setting up state '${state.state}'`);
        return stateFn.setup(state.params);
      }
      break;
    case 'teardown':
      if (stateFn.teardown) {
        logger.debug(`tearing down state '${state.state}'`);
        return stateFn.teardown(state.params);
      }
      break;
    default:
      logger.debug(`unknown state action '${state.action}' received, ignoring`);
  }

  return Promise.resolve();
};
