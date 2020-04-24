/**
 * Pact Publisher service
 * @module Publisher
 */
import { qToPromise } from "../common/utils"
import publisher, { PublisherOptions } from "@pact-foundation/pact-node"

export class Publisher {
  constructor(private opts: PublisherOptions) {}

  public publishPacts(): Promise<string[]> {
    return qToPromise<string[]>(publisher.publishPacts(this.opts))
  }
}
