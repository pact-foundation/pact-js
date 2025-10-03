const { server } = require('./consumer.js');

server.listen(8080, () => {
  console.log('Animal Matching Service listening on http://localhost:8080');
});
