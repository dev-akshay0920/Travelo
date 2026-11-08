import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { env } from "../../config/env";
import { ServiceUnavailableError } from "../errors/app-error";

type PublicObjectUpload = {
  key: string;
  body: Buffer;
  contentType: string;
  cacheControl: string;
};

type StoredPublicObject = {
  key: string;
  url: string;
  size: number;
};

let filebaseClient: S3Client | undefined;

function getFilebaseSettings() {
  const {
    FILEBASE_ENDPOINT: endpoint,
    FILEBASE_REGION: region,
    FILEBASE_BUCKET_NAME: bucket,
    FILEBASE_ACCESS_KEY_ID: accessKeyId,
    FILEBASE_SECRET_ACCESS_KEY: secretAccessKey,
    FILEBASE_PUBLIC_BASE_URL: publicBaseUrl,
  } = env;

  if (!endpoint || !region || !bucket || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
    throw new ServiceUnavailableError("File storage is not configured.");
  }

  return { endpoint, region, bucket, accessKeyId, secretAccessKey, publicBaseUrl };
}

function getFilebaseClient(): S3Client {
  if (!filebaseClient) {
    const { endpoint, region, accessKeyId, secretAccessKey } = getFilebaseSettings();
    filebaseClient = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  return filebaseClient;
}

function makePublicUrl(publicBaseUrl: string, key: string): string {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${publicBaseUrl.replace(/\/+$/, "")}/${encodedKey}`;
}

export const FileStorageService = {
  isConfigured(): boolean {
    return Boolean(
      env.FILEBASE_ENDPOINT &&
      env.FILEBASE_REGION &&
      env.FILEBASE_BUCKET_NAME &&
      env.FILEBASE_ACCESS_KEY_ID &&
      env.FILEBASE_SECRET_ACCESS_KEY &&
      env.FILEBASE_PUBLIC_BASE_URL
    );
  },

  async uploadPublicObject(input: PublicObjectUpload): Promise<StoredPublicObject> {
    const settings = getFilebaseSettings();

    try {
      await getFilebaseClient().send(
        new PutObjectCommand({
          Bucket: settings.bucket,
          Key: input.key,
          Body: input.body,
          ContentLength: input.body.length,
          ContentType: input.contentType,
          ContentDisposition: "inline",
          CacheControl: input.cacheControl,
        })
      );
    } catch (error) {
      console.error("File storage upload failed.", {
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      throw new ServiceUnavailableError("The uploaded file could not be stored right now.");
    }

    return {
      key: input.key,
      url: makePublicUrl(settings.publicBaseUrl, input.key),
      size: input.body.length,
    };
  },

  async deleteObject(key: string): Promise<void> {
    const { bucket } = getFilebaseSettings();

    try {
      await getFilebaseClient().send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );
    } catch (error) {
      console.warn("File storage object cleanup failed.", {
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
    }
  },

  close(): void {
    filebaseClient?.destroy();
    filebaseClient = undefined;
  },
};
