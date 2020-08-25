const pino = require("pino")
const pkg = require("./metadata")

const DEFAULT_LOG_LEVEL = "info"
const logLevel = (process.env.LOGLEVEL || DEFAULT_LOG_LEVEL).toLowerCase()
const pactLogFile = process.env.PACT_LOG_PATH

const destination = pactLogFile
  ? pino.destination(pactLogFile)
  : pino.destination(1)

const logOpts = {
  level: logLevel,
  prettyPrint: {
    messageFormat: `pact@${pkg.version}: {msg}`,
    translateTime: true,
  },
}

let logger = pino(logOpts, destination)

Object.defineProperties(logger, {
  level: {
    enumerable: true,
    value: (newLevel: string): void => {
      logger = pino(
        {
          ...logOpts,
          level: (newLevel || DEFAULT_LOG_LEVEL).toLowerCase(),
        },
        destination
      )
    },
  },
})

export default logger
