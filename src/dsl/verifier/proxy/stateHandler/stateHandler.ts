import express from 'express';

import { ProviderState, ProxyOptions } from '../types';
import { setupStates } from './setupStates';

export const createProxyStateHandler = (config: ProxyOptions) => (
  req: express.Request,
  res: express.Response
): Promise<express.Response> => {
  const message: ProviderState = req.body;

  return setupStates(message, config)
    .then(() => res.sendStatus(200))
    .catch((e) => res.status(500).send(e));
};
