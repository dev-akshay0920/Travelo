import { z } from "zod";
import { config as loadDotenv } from "dotenv";

loadDotenv();

const optionalUrl = z.preprocess(
  (value: unknown) => value === "" ? undefined : value,
  z.string().trim().url().optional()
);

const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),

  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),

  CLIENT_URL: z.string().url().default("http://localhost:3000"),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  BODY_JSON_LIMIT: z.string().default("1mb"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters")
    .default("travora-dev-jwt-secret-change-in-production-1234567890"),
  JWT_EXPIRY: z.string().default("7d"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_CALLBACK_URL: z.string().url().default("http://localhost:5000/api/v1/auth/google/callback"),
  FILEBASE_ENDPOINT: optionalUrl,
  FILEBASE_REGION: z.preprocess(
    (value: unknown) => value === "" ? undefined : value,
    z.string().trim().min(1).optional()
  ),
  FILEBASE_BUCKET_NAME: z.preprocess(
    (value: unknown) => value === "" ? undefined : value,
    z.string().trim().min(3).max(63).optional()
  ),
  FILEBASE_ACCESS_KEY_ID: z.preprocess(
    (value: unknown) => value === "" ? undefined : value,
    z.string().trim().min(1).optional()
  ),
  FILEBASE_SECRET_ACCESS_KEY: z.preprocess(
    (value: unknown) => value === "" ? undefined : value,
    z.string().min(1).optional()
  ),
  FILEBASE_PUBLIC_BASE_URL: optionalUrl,
}).superRefine((value, context) => {
  const filebaseValues = [
    value.FILEBASE_ENDPOINT,
    value.FILEBASE_REGION,
    value.FILEBASE_BUCKET_NAME,
    value.FILEBASE_ACCESS_KEY_ID,
    value.FILEBASE_SECRET_ACCESS_KEY,
    value.FILEBASE_PUBLIC_BASE_URL,
  ];
  const configuredCount = filebaseValues.filter((item) => item !== undefined).length;

  if (configuredCount > 0 && configuredCount < filebaseValues.length) {
    context.addIssue({
      code: "custom",
      message: "All FILEBASE_* variables must be configured together.",
      path: ["FILEBASE_ENDPOINT"],
    });
  }

  for (const [name, configuredUrl] of [
    ["FILEBASE_ENDPOINT", value.FILEBASE_ENDPOINT],
    ["FILEBASE_PUBLIC_BASE_URL", value.FILEBASE_PUBLIC_BASE_URL],
  ] as const) {
    if (!configuredUrl) {
      continue;
    }

    const parsedUrl = new URL(configuredUrl);
    if (
      parsedUrl.protocol !== "https:" ||
      parsedUrl.username ||
      parsedUrl.password ||
      parsedUrl.search ||
      parsedUrl.hash
    ) {
      context.addIssue({
        code: "custom",
        message: `${name} must be an HTTPS URL without credentials, query parameters, or a fragment.`,
        path: [name],
      });
    }
  }
});

export type Env = z.infer<typeof EnvSchema>;

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment configuration:\n",
    JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
  );
  process.exit(1);
}

export const env: Env = parsed.data;

export const isProduction: boolean = env.NODE_ENV === "production";
export const isDevelopment: boolean = env.NODE_ENV === "development";