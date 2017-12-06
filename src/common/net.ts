/**
 * Network module.
 * @module net
 * @private
 */

import * as net from "net";

const isPortAvailable = (port: number, host: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const server: any = net.createServer()
      .listen({ port, host, exclusive: true })
      .on("error", (e: any) => (e.code === "EADDRINUSE" ? reject(new Error(`Port ${port} is unavailable`)) : reject(e)))
      .on("listening", () => server.once("close", () => resolve()).close());
  });
};

export {
  isPortAvailable,
};
