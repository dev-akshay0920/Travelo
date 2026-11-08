import { randomUUID } from "node:crypto";
import { FileStorageService } from "../../shared/storage/file-storage.service";
import { ValidationError } from "../../shared/errors/app-error";

export const MAX_AGENCY_LOGO_SIZE = 5 * 1024 * 1024;

type AgencyLogoFormat = {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
};

export type StoredAgencyLogo = {
  key: string;
  url: string;
  contentType: AgencyLogoFormat["contentType"];
  size: number;
};

function detectAgencyLogoFormat(buffer: Buffer): AgencyLogoFormat {
  const isJpeg =
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;
  if (isJpeg) {
    return { contentType: "image/jpeg", extension: "jpg" };
  }

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length >= pngSignature.length && buffer.subarray(0, 8).equals(pngSignature)) {
    return { contentType: "image/png", extension: "png" };
  }

  const isWebp =
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP";
  if (isWebp) {
    return { contentType: "image/webp", extension: "webp" };
  }

  throw new ValidationError("Choose a valid JPEG, PNG, or WebP image.");
}

function getAgencyLogoPrefix(agencyId: string): string {
  return `agencies/${agencyId}/profile/`;
}

export const AgencyLogoStorage = {
  async upload(agencyId: string, buffer: Buffer): Promise<StoredAgencyLogo> {
    if (buffer.length === 0) {
      throw new ValidationError("Choose an image to upload.");
    }
    if (buffer.length > MAX_AGENCY_LOGO_SIZE) {
      throw new ValidationError("Agency image must be 5 MiB or smaller.");
    }

    const format = detectAgencyLogoFormat(buffer);
    const key = `${getAgencyLogoPrefix(agencyId)}${randomUUID()}.${format.extension}`;
    const storedObject = await FileStorageService.uploadPublicObject({
      key,
      body: buffer,
      contentType: format.contentType,
      cacheControl: "public, max-age=31536000, immutable",
    });

    return {
      key: storedObject.key,
      url: storedObject.url,
      contentType: format.contentType,
      size: storedObject.size,
    };
  },

  async deleteOwnedAgencyLogo(agencyId: string, key: string): Promise<void> {
    const expectedPrefix = getAgencyLogoPrefix(agencyId);
    const expectedKeyPattern = new RegExp(
      `^${expectedPrefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[0-9a-f-]+\\.(jpg|png|webp)$`
    );
    if (!expectedKeyPattern.test(key)) {
      return;
    }

    await FileStorageService.deleteObject(key);
  },
};
