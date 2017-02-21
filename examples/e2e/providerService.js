const { server, importData } = require('./provider.js')
importData()

server.listen(8081, () => {
  console.log('Animal Profile Service listening on http://localhost:8081')
})
