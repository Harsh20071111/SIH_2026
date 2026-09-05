import { logger } from "./logger";

/**
 * Utility to redact sensitive PII or specific patterns from unstructured text.
 */
export function redactText(text: string, rules: string[]): string {
  if (!text) return text;
  let redactedText = text;
  
  logger.info({ rules }, "Applying text redaction");
  
  if (rules.includes("POCSO")) {
    // In a real system, this would use an NER (Named Entity Recognition) model
    // to identify names, ages, and locations associated with the victim.
    // For demonstration, we'll replace potential names with [REDACTED].
    
    // Naive regex to match capitalized words as names (very basic)
    const nameRegex = /\b[A-Z][a-z]+\b/g;
    redactedText = redactedText.replace(nameRegex, "[REDACTED_NAME]");
  }
  
  if (rules.includes("CONTACT_INFO")) {
    // Redact phone numbers (10 digits)
    const phoneRegex = /\b\d{10}\b/g;
    redactedText = redactedText.replace(phoneRegex, "[REDACTED_PHONE]");
    
    // Redact emails
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    redactedText = redactedText.replace(emailRegex, "[REDACTED_EMAIL]");
  }
  
  return redactedText;
}
