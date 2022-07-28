import pact from '@pact-foundation/pact-core';
import * as mockery from 'mockery';

// used to kill any left over mock server instances
process.on('SIGINT', () => {
  pact.removeAllServers();
});

mockery.enable();
mockery.warnOnUnregistered(false);
