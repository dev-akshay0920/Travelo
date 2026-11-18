import pino, { type Logger } from "pino";
import { env } from "../config/env";

const PII_FIELDS = [
  "email",
  "phone",
  "name",
  "firstName",
  "lastName",
  "travellerName",
  "travelerName",
  "travelerEmail",
  "travelerPhone",
  "customerName",
  "customerEmail",
  "customerPhone",
  "full_name",
  "phone_number",
  "address",
  "street",
  "city",
  "zip",
  "postalCode",
  "ssn",
  "passportNumber",
  "dateOfBirth",
];

const redactPaths: string[] = [];
for (const field of PII_FIELDS) {
  redactPaths.push(`*.${field}`, field);
}

const transport =
  env.NODE_ENV === "development"
    ? pino.transport({
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" },
      })
    : undefined;

export const logger: Logger = pino(
  {
    level: env.LOG_LEVEL,
    redact: { paths: redactPaths, censor: "**redacted**" },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: { service: "travora-backend", env: env.NODE_ENV },
  },
  transport
);

export const logError = (err: unknown, context?: string): void => {
  logger.error(
    { err, context },
    context ? `Error in ${context}` : "Unhandled error"
  );
};

export const logInfo = (msg: string, meta?: Record<string, unknown>): void => {
  logger.info(meta, msg);
};

export const logWarn = (msg: string, meta?: Record<string, unknown>): void => {
  logger.warn(meta, msg);
};

export default logger;
