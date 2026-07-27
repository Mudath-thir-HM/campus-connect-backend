import { sql } from "../db/client";
import type { OtpVerification } from "../db/models/user.model";

export const otpRepository = {
  async create(
    userId: string,
    code: string,
    purpose: string,
    expiresAt: Date,
  ): Promise<OtpVerification> {
    const [otp] = await sql`
      INSERT INTO otp_verifications (user_id, code, purpose, expires_at)
      VALUES (${userId}, ${code}, ${purpose}, ${expiresAt})
      RETURNING *
    `;
    return otp as OtpVerification;
  },

  async findLatestValid(
    userId: string,
    purpose: string,
  ): Promise<OtpVerification | null> {
    const [otp] = await sql`
      SELECT * FROM otp_verifications
      WHERE user_id = ${userId} AND purpose = ${purpose}
        AND verified_at IS NULL AND expires_at > now()
      ORDER BY created_at DESC LIMIT 1
    `;
    return (otp as OtpVerification) ?? null;
  },

  async markVerified(id: string): Promise<void> {
    await sql`UPDATE otp_verifications SET verified_at = now() WHERE id = ${id}`;
  },
};
