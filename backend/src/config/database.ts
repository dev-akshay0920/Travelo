import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "../lib/logger";

let connectingPromise: Promise<typeof mongoose> | null = null;

export const connectDatabase = async (): Promise<void> => {
  if (connectingPromise) {
    return connectingPromise.then(() => undefined);
  }

  mongoose.set("strictQuery", true);

  connectingPromise = mongoose
    .connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    })
    .then(() => mongoose);

  try {
    await connectingPromise;
  } catch (error) {
    connectingPromise = null;
    logger.error({ err: error }, "Failed to connect to MongoDB");
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};