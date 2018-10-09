import wrapper from "@pact-foundation/pact-node"

// used to kill any left over mock server instances
process.on("SIGINT", () => {
  wrapper.removeAllServers()
})
