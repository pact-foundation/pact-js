import { ConsumerPact, makeConsumerPact } from '@pact-foundation/pact-core';
import { UnconfiguredInteraction } from './http';
import { PactV4Options, V4UnconfiguredInteraction } from './http/types';
import { V4ConsumerPact } from './types';
import { version as pactPackageVersion } from '../../package.json';
import { V4UnconfiguredSynchronousMessage } from './message/types';
import { UnconfiguredSynchronousMessage } from './message';
import { SpecificationVersion } from '../v3';

export class PactV4 implements V4ConsumerPact {
  private pact: ConsumerPact;

  constructor(private opts: PactV4Options) {
    if (!process.env.ENABLE_FEATURE_V4) {
      throw Error(
        "The v4 package is currently in beta and requires the 'ENABLE_FEATURE_V4' environment variable to be set"
      );
    }

    this.pact = makeConsumerPact(
      opts.consumer,
      opts.provider,
      opts.spec ?? SpecificationVersion.SPECIFICATION_VERSION_V4,
      opts.logLevel
    );

    this.pact.addMetadata('pact-js', 'version', pactPackageVersion);
  }

  addInteraction(): V4UnconfiguredInteraction {
    return new UnconfiguredInteraction(
      this.pact,
      this.pact.newInteraction(''),
      this.opts
    );
  }

  addSynchronousInteraction(
    description: string
  ): V4UnconfiguredSynchronousMessage {
    return new UnconfiguredSynchronousMessage(
      this.pact,
      this.pact.newSynchronousMessage(description),
      this.opts
    );
  }
}
