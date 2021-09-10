import express from 'express';

import { ProxyOptions, ProviderState } from '../types';
import { setupStates } from './setupStates';

export const createProxyStateHandler =
  (config: ProxyOptions) =>
  (req: express.Request, res: express.Response): Promise<express.Response> => {
    const message: ProviderState = req.body;

    return Promise.resolve(setupStates(message, config))
      .then((data) => res.json(data))
      .catch((e) => res.status(500).send(e));
  };
