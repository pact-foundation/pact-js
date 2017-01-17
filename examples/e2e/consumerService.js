var server = require('./consumer.js');

var server = server.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Animal Matching Service listening on http://%s:%s", host, port)
})
