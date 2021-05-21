/**
 * Pact Publisher service
 * @module Publisher
 */
import publisher, { PublisherOptions } from '@pact-foundation/pact-core';

export class Publisher {
  constructor(private opts: PublisherOptions) {}

  public publishPacts(): Promise<string[]> {
    return publisher.publishPacts(this.opts);
  }
}
