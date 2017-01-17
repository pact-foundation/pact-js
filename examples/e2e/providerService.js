var server = require('./provider.js');

var server = server.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Animal Profile Service listening on http://%s:%s", host, port)
})
