const {exec} = require('child_process')
exec('npx node-pre-gyp reveal', {}, (error, stdout, stderr) => {
  if (error) {
    console.error("Failed to get info about the native lib", error)
    throw error
  }

  const info = JSON.parse(stdout)
  console.log(JSON.stringify(info))
})
