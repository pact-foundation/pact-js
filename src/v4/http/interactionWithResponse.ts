import type { ConsumerPact } from '@pact-foundation/pact-core';
import { executeTest } from '.';
import type {
  PactV4Options,
  TestFunction,
  V4InteractionWithResponse,
} from './types';

export class InteractionWithResponse implements V4InteractionWithResponse {
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private opts: PactV4Options,
    protected cleanupFn: () => void,
  ) {}

  async executeTest<T>(testFn: TestFunction<T>): Promise<T | undefined> {
    return executeTest(this.pact, this.opts, testFn, this.cleanupFn);
  }
}
