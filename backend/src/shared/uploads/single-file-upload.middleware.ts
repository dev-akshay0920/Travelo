import multer from "multer";
import type { RequestHandler } from "express";
import { PayloadTooLargeError, ValidationError } from "../errors/app-error";

export function singleFileUpload(
  fieldName: string,
  maxFileSizeBytes: number
): RequestHandler {
  const parser = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxFileSizeBytes,
      files: 1,
      fields: 0,
      parts: 1,
    },
  }).single(fieldName);

  return (req, res, next) => {
    parser(req, res, (error: unknown) => {
      if (!error) {
        next();
        return;
      }

      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
        next(new PayloadTooLargeError(`Uploaded file must be ${Math.floor(maxFileSizeBytes / (1024 * 1024))} MiB or smaller.`));
        return;
      }

      if (error instanceof multer.MulterError) {
        next(new ValidationError(`Upload exactly one file using the "${fieldName}" field.`));
        return;
      }

      next(new ValidationError("The multipart file request is malformed."));
    });
  };
}
