/* tslint:disable no-console */

import { Publisher } from "@pact-foundation/pact"
import { resolve } from "path"
import { execSync } from "child_process"

const exec = command =>
  execSync(command)
    .toString()
    .trim()

if (process.env.CI !== "true") {
  console.log("Skipping Pact publish as not on CI")
  process.exit(0)
}

// Usually, you would just use the CI env vars, but to allow these examples to run from
// local development machines, we'll fall back to the git command when the env vars aren't set.
const gitSha = process.env.TRAVIS_COMMIT || exec("git rev-parse HEAD")
const branch =
  process.env.TRAVIS_BRANCH || exec("git rev-parse --abbrev-ref HEAD")

new Publisher({
  pactFilesOrDirs: [resolve(process.cwd(), "pact/pacts")],
  pactBroker: "https://test.pact.dius.com.au",
  pactBrokerUsername: "dXfltyFMgNOFZAxr8io9wJ37iUpY42M",
  pactBrokerPassword: "O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1",
  consumerVersion: gitSha as string,
  tags: [(branch as string) || "master"],
})
  .publishPacts()
  .then(
    () => {
      console.log("Pact contract publishing complete!")
      console.log("")
      console.log("Head over to https://test.pact.dius.com.au/ and login with")
      console.log("=> Username: dXfltyFMgNOFZAxr8io9wJ37iUpY42M")
      console.log("=> Password: O5AIZWxelWbLvqMd8PkAVycBJh2Psyg1")
      console.log("to see your published contracts.")
    },
    e => {
      console.error("Pact contract publishing failed: ", e)
    }
  )
