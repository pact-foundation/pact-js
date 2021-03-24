/**
 * Pact Publisher service
 * @module Publisher
 */
import publisher, { PublisherOptions } from "@pact-foundation/pact-core"
import { qToPromise } from "../common/utils"

export class Publisher {
  constructor(private opts: PublisherOptions) {}

  public publishPacts(): Promise<string[]> {
    return qToPromise<string[]>(publisher.publishPacts(this.opts))
  }
}
