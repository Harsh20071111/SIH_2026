import { logger } from "./logger";

/**
 * Redaction utility for sensitive PII and statutory protections (e.g. POCSO, Aadhaar).
 * IMPLEMENTED: Regex-based pattern matching and keyword masking.
 */
export function redactText(text: string, rules: string[]): string {
  if (!text) return text;
  let redactedText = text;

  logger.info({ rules }, "Applying text redaction rules");

  if (rules.includes("POCSO")) {
    // Mask minor names or patterns flagged for POCSO protection
    const nameRegex = /\b[A-Z][a-z]+\b/g;
    redactedText = redactedText.replace(nameRegex, "[REDACTED_NAME]");
  }

  if (rules.includes("CONTACT_INFO")) {
    // Redact 10-digit phone numbers
    const phoneRegex = /\b\d{10}\b/g;
    redactedText = redactedText.replace(phoneRegex, "[REDACTED_PHONE]");

    // Redact email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    redactedText = redactedText.replace(emailRegex, "[REDACTED_EMAIL]");
  }

  if (rules.includes("AADHAAR")) {
    // Mask Aadhaar numbers, leaving last 4 digits
    const aadhaarRegex = /\b\d{4}[-\s]?\d{4}[-\s]?(\d{4})\b/g;
    redactedText = redactedText.replace(aadhaarRegex, "XXXX-XXXX-$1");
  }

  return redactedText;
}
