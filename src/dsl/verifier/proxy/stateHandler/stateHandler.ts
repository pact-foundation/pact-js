import express from 'express';

import StackUtils from 'stack-utils';
import chalk from 'chalk';
import { ProxyOptions, ProviderState } from '../types';
import { setupStates } from './setupStates';

const cleanStack = (e: Error) => {
  const stack = new StackUtils({
    cwd: process.cwd(),
    internals: StackUtils.nodeInternals(),
  });

  if (!e.stack) return '';
  const cleanedStack = stack.clean(e.stack);
  const lines = cleanedStack.split('\n').map((line) => line.trim());

  return lines[0];
};

export const createProxyStateHandler =
  (config: ProxyOptions) =>
  async (
    req: express.Request,
    res: express.Response
  ): Promise<express.Response> => {
    const state: ProviderState = req.body;
    try {
      const data = await setupStates(state, config);
      return res.json(data);
    } catch (e) {
      const error = `\nError executing state handler for state '${state.state}' on '${state.action}'.`;
      const errorDetails = `↳ Error details: ${e.message}`;
      const errorSource = `↳ Error source: ${cleanStack(e)}\n`;
      /* eslint-disable no-console */
      console.log(chalk.red(error));
      console.log(chalk.red(errorDetails));
      console.log(chalk.red(errorSource));
      /* eslint-enable */

      return res.status(200).send();
    }
  };
