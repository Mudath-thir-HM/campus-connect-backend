export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

export function otpExpiryDate(): Date {
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);
  return new Date(Date.now() + minutes * 60_000);
}
