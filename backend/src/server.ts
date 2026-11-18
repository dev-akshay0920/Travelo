import http from "node:http";
import { createApp } from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { RoleService } from "./modules/roles/role.service";
import { seedPolicyTemplates } from "./modules/packages/policy-template.seed";
import { FileStorageService } from "./shared/storage/file-storage.service";
import { logger } from "./lib/logger";

const start = async (): Promise<void> => {
  try {
    await connectDatabase();
    await RoleService.seedDefaults();
    await seedPolicyTemplates();
  } catch (error) {
    logger.error({ err: error }, "Exiting due to startup failure");
    process.exit(1);
  }

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`Travora backend started on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (_signal: string): Promise<void> => {
    const closeServer = (): Promise<void> =>
      new Promise((resolve) => {
        server.close((err) => {
          if (err) {
            logger.error({ err }, "Error closing HTTP server");
            resolve();
            return;
          }
          resolve();
        });
      });

    server.closeIdleConnections?.();

    await closeServer();
    FileStorageService.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection");
  });
  process.on("uncaughtException", (err) => {
    logger.error({ err }, "Uncaught exception");
    void shutdown("uncaughtException");
  });
};

void start();
