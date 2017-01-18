const pact = require('@pact-foundation/pact-node');
const path = require('path');
const provider = require('../provider');
let stateData = "";

// Append some extra endpoints to mutate current state of the API
server.get('/provider-states', function (req, res) {
	res.json({me: ['There is a greeting'], anotherclient: ['There is a greeting']});
});

server.post('/provider-state', function (req, res) {
	stateData = 'State data!';
	res.json({ greeting: stateData });
});

let opts = {
	providerBaseUrl: 'http://localhost:8081',
	providerStatesUrl: 'http://localhost:8081/states',
	providerStatesSetupUrl: 'http://localhost:8081/setup',
	pactUrls: [path.resolve(__dirname, '../pacts/my_consumer-posts_provider.json')]
};

pact.verifyPacts(opts).then(() => {
	console.log('success');
	process.exit(0);
}).catch((error) => {
	console.log('failed', error);
	process.exit(1);
});
