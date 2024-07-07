import { ConsumerPact } from '@pact-foundation/pact-core';
import { executeTest } from '.';
import {
  V4InteractionWithPluginResponse,
  PactV4Options,
  V4MockServer,
} from './types';

export class InteractionWithPluginResponse
  implements V4InteractionWithPluginResponse
{
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private opts: PactV4Options,
    protected cleanupFn: () => void
  ) {}

  async executeTest<T>(
    testFn: (mockServer: V4MockServer) => Promise<T>
  ): Promise<T | undefined> {
    return executeTest(this.pact, this.opts, testFn, this.cleanupFn);
  }
}
