var stateData = "";

server.get('/provider-states', function (req, res) {
	res.json({me: ["There is a greeting"], anotherclient: ["There is a greeting"]});
});

server.post('/provider-state', function (req, res) {
	stateData = "State data!";
	res.json({greeting: stateData});
});
