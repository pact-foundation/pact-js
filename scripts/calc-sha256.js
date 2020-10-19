const sha256File = require('sha256-file')
const fs = require('fs')

sha256File('./native/index.node', function (error, sum) {
  if (error) return console.log("Failed to calculate SHA256 for ./native/index.node", error);
  fs.writeFile('./native/index.node.sha256', sum, function (err) {
    if (err) return console.log("could not write to ./native/index.node.sha256", err);
  })
})
