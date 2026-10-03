import crypto from "crypto";

// Generates a raw token to email/SMS to the user, plus its hashed form
// to store in the DB — we never keep the raw, usable token at rest.
export const generateResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  return { rawToken, hashedToken };
};

export const hashToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");
