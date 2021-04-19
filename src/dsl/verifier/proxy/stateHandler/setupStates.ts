import logger from '../../../../common/logger';
import { ProviderState, ProxyOptions } from '../types';

// Lookup the handler based on the description, or get the default handler
export const setupStates = (
  descriptor: ProviderState,
  config: ProxyOptions
): Promise<unknown> => {
  const promises: Array<Promise<unknown>> = [];

  if (descriptor.states) {
    descriptor.states.forEach((state) => {
      const handler = config.stateHandlers ? config.stateHandlers[state] : null;

      if (handler) {
        promises.push(handler());
      } else {
        logger.warn(`No state handler found for "${state}", ignoring`);
      }
    });
  }

  return Promise.all(promises);
};
