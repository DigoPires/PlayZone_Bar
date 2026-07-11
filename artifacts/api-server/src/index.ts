import 'dotenv/config';
import app from "./app";
import { logger } from "./lib/logger";

const isRenderRuntime = Boolean(process.env.RENDER) || process.env.NODE_ENV === "production";
const rawPort = isRenderRuntime
  ? process.env["PORT"] || process.env["API_PORT"] || "10000"
  : process.env["API_PORT"] || process.env["PORT"] || "5000";
const requestedPort = Number(rawPort);

if (Number.isNaN(requestedPort) || requestedPort <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

function startServer(port: number, attempt = 1): void {
  const server = app.listen(port, () => {
    logger.info({ port }, "Server listening");
  });

  server.once("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE" && attempt < 10) {
      logger.warn(
        { port, nextPort: port + 1 },
        "Port already in use, trying the next one",
      );
      startServer(port + 1, attempt + 1);
      return;
    }

    logger.error({ err, port }, "Error listening on port");
    process.exit(1);
  });
}

startServer(requestedPort);
