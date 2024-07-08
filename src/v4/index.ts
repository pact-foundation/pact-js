import { ConsumerPact, makeConsumerPact } from '@pact-foundation/pact-core';
import { UnconfiguredInteraction } from './http/unconfiguredInteraction';
import { PactV4Options, V4UnconfiguredInteraction } from './http/types';
import { V4ConsumerPact } from './types';
import { version as pactPackageVersion } from '../../package.json';
import {
  V4UnconfiguredAsynchronousMessage,
  V4UnconfiguredSynchronousMessage,
} from './message/types';
import { UnconfiguredSynchronousMessage } from './message';
import { SpecificationVersion } from '../v3';
import { V4UnconfiguredGraphQLInteraction } from './graphql/types';
import { UnconfiguredGraphQLInteraction } from './graphql';
import { UnconfiguredAsynchronousMessage } from './message/asynchronousMessage';

export class PactV4 implements V4ConsumerPact {
  private pact: ConsumerPact;

  constructor(private opts: PactV4Options) {
    this.setup();
    this.pact.addMetadata('pact-js', 'version', pactPackageVersion);
  }

  setup(): void {
    this.pact = makeConsumerPact(
      this.opts.consumer,
      this.opts.provider,
      this.opts.spec ?? SpecificationVersion.SPECIFICATION_VERSION_V4,
      this.opts.logLevel ?? 'info'
    );
  }

  addInteraction(): V4UnconfiguredInteraction {
    return new UnconfiguredInteraction(
      this.pact,
      this.pact.newInteraction(''),
      this.opts,
      () => {
        // This function needs to be called if the PactV4 object is to be re-used (commonly expected by users)
        // Because of the type-state model used here, it's a bit awkward as we need to thread this through
        // to children, ultimately to be called on the "executeTest" stage.
        this.setup();
      }
    );
  }

  addSynchronousInteraction(
    description: string
  ): V4UnconfiguredSynchronousMessage {
    return new UnconfiguredSynchronousMessage(
      this.pact,
      this.pact.newSynchronousMessage(description),
      this.opts,
      () => {
        // This function needs to be called if the PactV4 object is to be re-used (commonly expected by users)
        // Because of the type-state model used here, it's a bit awkward as we need to thread this through
        // to children, ultimately to be called on the "executeTest" stage.
        this.setup();
      }
    );
  }

  addAsynchronousInteraction(): V4UnconfiguredAsynchronousMessage {
    return new UnconfiguredAsynchronousMessage(
      this.pact,
      this.pact.newAsynchronousMessage(''),
      this.opts,
      () => {
        // This function needs to be called if the PactV4 object is to be re-used (commonly expected by users)
        // Because of the type-state model used here, it's a bit awkward as we need to thread this through
        // to children, ultimately to be called on the "executeTest" stage.
        this.setup();
      }
    );
  }

  addGraphQLInteraction(): V4UnconfiguredGraphQLInteraction {
    return new UnconfiguredGraphQLInteraction(
      this.pact,
      this.pact.newInteraction(''),
      this.opts,
      () => {
        // This function needs to be called if the PactV4 object is to be re-used (commonly expected by users)
        // Because of the type-state model used here, it's a bit awkward as we need to thread this through
        // to children, ultimately to be called on the "executeTest" stage.
        this.setup();
      }
    );
  }
}
