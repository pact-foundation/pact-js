import * as path from "path"
import { Injectable } from "@nestjs/common"
import {
  PactConsumerOptionsFactory,
  PactConsumerOverallOptions,
} from "nestjs-pact"

@Injectable()
export class PactConsumerConfigOptionsService
  implements PactConsumerOptionsFactory {
  public createPactConsumerOptions(): PactConsumerOverallOptions {
    // Usually, you would just use the CI env vars, but to allow these examples to run from
    // local development machines, we'll fall back to the git command when the env vars aren't set.
    const gitSha = process.env.TRAVIS_COMMIT // || exec('git rev-parse HEAD');
    const branch = process.env.TRAVIS_BRANCH // || exec('git rev-parse --abbrev-ref HEAD');

    return {
      consumer: {
        // port: 1234, // You can set the port explicitly here or dynamically (see setup() below)
        log: path.resolve(process.cwd(), "logs", "mockserver-integration.log"),
        dir: path.resolve(process.cwd(), "pacts"),
        logLevel: "warn",
        spec: 2,
      },
      publication: {
        pactFilesOrDirs: [path.resolve(process.cwd(), "pact/pacts")],
        pactBroker: "https://test.pact.dius.com.au",
        pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
        pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
        consumerVersion: (gitSha as string) || "1.0.0",
        tags: [(branch as string) || "master"],
      },
    }
  }
}
