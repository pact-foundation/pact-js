import { server } from './provider';

server.listen(8081, () => {
  console.log('SOAP Service listening on http://localhost:8081');
});
