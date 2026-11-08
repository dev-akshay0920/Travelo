import http from "node:http";
import { createApp } from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { RoleService } from "./modules/roles/role.service";
import { seedPolicyTemplates } from "./modules/packages/policy-template.seed";
import { FileStorageService } from "./shared/storage/file-storage.service";

const start = async (): Promise<void> => {
  try {
    await connectDatabase();
    await RoleService.seedDefaults();
    await seedPolicyTemplates();
  } catch (error) {
    console.error("Exiting due to startup failure", error);
    process.exit(1);
  }

  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    console.error(`Travora backend started on port ${env.PORT} (${env.NODE_ENV})`);
  });

  const shutdown = async (_signal: string): Promise<void> => {
    const closeServer = (): Promise<void> =>
      new Promise((resolve) => {
        server.close((err) => {
          if (err) {
            console.error("Error closing HTTP server", err);
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
    console.error("Unhandled promise rejection", reason);
  });
  process.on("uncaughtException", (err) => {
    console.error("Uncaught exception", err);
    void shutdown("uncaughtException");
  });
};

void start();