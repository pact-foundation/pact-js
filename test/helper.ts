'use strict'

import * as  chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import wrapper from '@pact-foundation/pact-node';

chai.use(sinonChai);
chai.use(chaiAsPromised);

// used to kill any left over mock server instances
process.on('SIGINT', () => {
  wrapper.removeAllServers();
});
