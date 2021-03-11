"use strict"

const path = require("path")
const test = require("ava")
const pact = require("@pact-foundation/pact")
const Pact = pact.Pact
const getMeDogs = require("../index").getMeDogs

const url = "http://localhost"
const port = 8989

const provider = new Pact({
  port: port,
  log: path.resolve(process.cwd(), "logs", "mockserver-integration.log"),
  dir: path.resolve(process.cwd(), "pacts"),
  spec: 2,
  consumer: "Ava Consumer Example",
  provider: "Ava Provider Example",
  pactfileWriteMode: "merge",
})

test.before("setting up Dog API expectations", async () => {
  await provider.setup()
})

test("Dog API GET /dogs", async t => {
  t.plan(1)

  // BEGIN -
  // Setup interactions for expected API response from provider
  // This is done due to similar reasons of tear-up/down of database
  // data in tests.
  const interaction = {
    state: "i have a list of dogs",
    uponReceiving: "a request for all dogs",
    withRequest: {
      method: "GET",
      path: "/dogs",
      headers: {
        Accept: "application/json",
      },
    },
    willRespondWith: {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: [
        {
          dog: pact.Matchers.somethingLike(1),
          name: pact.Matchers.term({
            matcher: "(\\S+)",
            generate: "rocky",
          }),
        },
      ],
    },
  }

  await provider.addInteraction(interaction)
  // END

  const urlAndPort = {
    url: url,
    port: port,
  }
  const response = await getMeDogs(urlAndPort)
  t.deepEqual(response.data, [
    {
      dog: 1,
      name: "rocky",
    },
  ])

  // verify with Pact, and reset expectations
  await provider.verify()
})

test.after.always("pact.js mock server graceful shutdown", async () => {
  await provider.finalize()
})
