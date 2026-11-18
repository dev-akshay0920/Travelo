import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { env } from "../config/env";
import { logger } from "../lib/logger";

const BACKUP_ROOT = process.env.BACKUP_DIR ?? join(process.cwd(), "backups");
const MONGODB_URI = env.MONGODB_URI;

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

export async function runPitrBackup(): Promise<void> {
  const runId = timestamp();
  const backupDir = join(BACKUP_ROOT, `backup-${runId}`);
  mkdirSync(backupDir, { recursive: true });

  logger.info({ backupDir, runId }, "Starting MongoDB PITR backup");

  // Extract database name from connection URI
  const dbName = MONGODB_URI.split("/").pop()?.split("?")[0] ?? "travora";

  // 1. Base backup (mongodump) with oplog for PITR
  try {
    execSync(
      `mongodump --uri="${MONGODB_URI}" --db="${dbName}" --oplog --out="${backupDir}"`,
      { stdio: "inherit", timeout: 300000 }
    );
    logger.info({ backupDir, runId, dbName }, "MongoDB PITR backup completed");
  } catch (error) {
    logger.error({ err: error, backupDir, runId }, "MongoDB PITR backup failed");
    throw error;
  }
}

if (require.main === module) {
  runPitrBackup().catch((error) => {
    logger.error({ err: error }, "PITR backup script exited with error");
    process.exit(1);
  });
}
