import { logger } from "./logger";

/**
 * Watermark Service
 *
 * STATUS: PLACEHOLDER / FUTURE
 * Binary document watermarking (overlaying officer badge/timestamp on PDF/TIFF pages)
 * requires native binaries (sharp / pdf-lib). To maintain 100% honesty per project guidelines,
 * this function is explicitly documented as a placeholder. It returns the buffer intact and logs
 * the planned watermark metadata rather than claiming dynamic PDF stamping is active.
 */
export async function applyWatermark(
  fileBuffer: Buffer,
  watermarkText: string,
  mimeType: string
): Promise<{ buffer: Buffer; applied: boolean; note: string }> {
  logger.info(
    { watermarkText, mimeType, status: "PLACEHOLDER" },
    "Watermarking requested - marked as PLACEHOLDER/FUTURE"
  );

  return {
    buffer: fileBuffer,
    applied: false,
    note: "Document watermarking is designated as FUTURE enhancement pending binary PDF pipeline integration.",
  };
}
