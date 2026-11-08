import { v4 as uuidv4 } from "uuid";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../../config/env";
import { ServiceUnavailableError, ValidationError } from "../../shared/errors/app-error";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;
const PRESIGNED_URL_EXPIRY = 15 * 60;

let s3Client: S3Client | undefined;

function getS3Settings() {
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

function getS3Client(): S3Client {
  if (!s3Client) {
    const { endpoint, region, accessKeyId, secretAccessKey } = getS3Settings();
    s3Client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return s3Client;
}

function makePublicUrl(publicBaseUrl: string, key: string): string {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `${publicBaseUrl.replace(/\/+$/, "")}/${encodedKey}`;
}

function validateFileType(mimeType: string): void {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new ValidationError("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
  }
}

function validateFileSize(size: number): void {
  if (size > MAX_FILE_SIZE) {
    throw new ValidationError(`File size must be ${MAX_FILE_SIZE / (1024 * 1024)}MB or smaller.`);
  }
}

function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

function generateImageKey(packageId: string, mimeType: string): string {
  const uuid = uuidv4();
  const ext = getExtensionFromMimeType(mimeType);
  return `packages/${packageId}/${uuid}.${ext}`;
}

export interface UploadedImage {
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

export interface ImageMetadata {
  url: string;
  key: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
  createdAt: Date;
}

export const PackageImageStorage = {
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

  async generatePresignedUploadUrl(
    packageId: string,
    mimeType: string,
    _fileName: string
  ): Promise<{ uploadUrl: string; key: string; expiresIn: number }> {
    validateFileType(mimeType);

    const settings = getS3Settings();
    const key = generateImageKey(packageId, mimeType);

    const command = new PutObjectCommand({
      Bucket: settings.bucket,
      Key: key,
      ContentType: mimeType,
    });

    const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: PRESIGNED_URL_EXPIRY });

    return { uploadUrl, key, expiresIn: PRESIGNED_URL_EXPIRY };
  },

  async uploadImage(
    packageId: string,
    file: Buffer,
    mimeType: string,
    key?: string
  ): Promise<UploadedImage> {
    validateFileType(mimeType);
    validateFileSize(file.length);

    const settings = getS3Settings();
    const imageKey = key || generateImageKey(packageId, mimeType);

    try {
      await getS3Client().send(
        new PutObjectCommand({
          Bucket: settings.bucket,
          Key: imageKey,
          Body: file,
          ContentLength: file.length,
          ContentType: mimeType,
          ContentDisposition: "inline",
          CacheControl: "public, max-age=31536000",
        })
      );
    } catch (error) {
      console.error("File storage upload failed.", {
        errorName: error instanceof Error ? error.name : "UnknownError",
      });
      throw new ServiceUnavailableError("The uploaded file could not be stored right now.");
    }

    return {
      url: makePublicUrl(settings.publicBaseUrl, imageKey),
      key: imageKey,
      size: file.length,
      mimeType,
    };
  },

  async deleteImage(key: string): Promise<void> {
    const { bucket } = getS3Settings();

    try {
      await getS3Client().send(
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

  async deleteImages(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.deleteImage(key)));
  },

  getPublicUrl(key: string): string {
    const { publicBaseUrl } = getS3Settings();
    return makePublicUrl(publicBaseUrl, key);
  },

  getMaxImages(): number {
    return MAX_IMAGES;
  },

  getMaxFileSize(): number {
    return MAX_FILE_SIZE;
  },

  getAllowedMimeTypes(): string[] {
    return ALLOWED_MIME_TYPES;
  },
};