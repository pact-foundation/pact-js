import { server } from './consumer';

server.listen(8080, () => {
  console.log('Animal Matching Service listening on http://localhost:8080');
});
