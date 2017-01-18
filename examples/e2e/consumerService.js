let { server } = require('./consumer.js');

server = server.listen(8080, () => {
  const host = server.address().address;
  const port = server.address().port;

  console.log(`Animal Matching Service listening on http://${host}:${port}`);
});
