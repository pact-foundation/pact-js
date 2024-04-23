import pact from '@pact-foundation/pact-core';

// used to kill any left over mock server instances
process.on('SIGINT', () => {
  pact.removeAllServers();
});
