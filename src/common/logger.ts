import * as bunyan from "bunyan";
const PrettyStream = require("bunyan-prettystream");

const path = require("path");
const packpath = require("packpath");

// Look up package.json regardless of nesting
const manifestFile = path.join(packpath.self(), "package.json");
const pkg = require(manifestFile);
const prettyStdOut = new PrettyStream();
prettyStdOut.pipe(process.stdout);

export class Logger extends bunyan {
  public time(action: string, startTime: number) {
    const time = Date.now() - startTime;
    this.info({
      action,
      duration: time,
      type: "TIMER",
    }, `TIMER: ${action} completed in ${time} milliseconds`);
  }

  public get logLevelName(): string {
    return bunyan.nameFromLevel[this.level()];
  }
}

export default new Logger({
  name: `pact@${pkg.version}`,
  streams: [{
    level: (process.env.LOGLEVEL || "info") as bunyan.LogLevel,
    stream: prettyStdOut,
    type: "raw",
  }],
});
