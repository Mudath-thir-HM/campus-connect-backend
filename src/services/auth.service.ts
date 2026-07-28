import { userRepository } from "../repositories/user.repository";
import { otpRepository } from "../repositories/otp.repository";
import { sendSms } from "../utils/sms";
import { sendEmail } from "../utils/email";
import { generateOtpCode, otpExpiryDate } from "../utils/otp";
import { normalizeNigerianPhone } from "../utils/phone";
import { notificationService } from "./notification.service";

export class AuthError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export const authService = {
  async register(input: {
    full_name: string;
    matric_number: string;
    email: string;
    phone: string;
    password: string;
  }) {
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeNigerianPhone(input.phone);
    } catch {
      throw new AuthError(
        "INVALID_PHONE",
        "Please enter a valid Nigerian phone number",
      );
    } // normalize before anything else touches it

    const existing = await userRepository.findByEmailOrPhoneOrMatric(
      input.email,
      normalizedPhone,
      input.matric_number,
    );
    if (existing)
      throw new AuthError(
        "ALREADY_REGISTERED",
        "Email, phone, or matric number already registered",
      );

    const password_hash = await Bun.password.hash(input.password);
    const user = await userRepository.create({
      ...input,
      phone: normalizedPhone,
      password_hash,
    });

    await this.issueAndSendOtp(user.id, user.email, user.phone, "signup");
    await notificationService.notify(
      user.id,
      "welcome",
      "Welcome!",
      "Welcome to Campus Connect. Complete your profile setup to get started.",
      null,
    );

    return { id: user.id, message: "Registered. OTP sent to email and phone." };
  },

  async issueAndSendOtp(
    userId: string,
    email: string,
    phone: string,
    purpose: "signup" | "login" | "password_reset",
  ) {
    const code = generateOtpCode();
    await otpRepository.create(userId, code, purpose, otpExpiryDate());

    const results = await Promise.allSettled([
      sendEmail(
        email,
        "Your Campus Connect OTP",
        `Your verification code is ${code}`,
      ),
      sendSms(phone, `Your Campus Connect verification code is ${code}`),
    ]);

    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(
          `OTP channel ${i === 0 ? "email" : "sms"} failed:`,
          r.reason,
        );
      }
    });
  },

  async verifyOtp(userId: string, code: string) {
    const otp = await otpRepository.findLatestValid(userId, "signup");
    if (!otp || otp.code !== code) throw new Error("Invalid or expired OTP");

    await otpRepository.markVerified(otp.id);
    await userRepository.markPhoneVerified(userId);

    return { message: "Phone verified successfully" };
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user)
      throw new AuthError("INVALID_CREDENTIALS", "Invalid credentials");

    const valid = await Bun.password.verify(password, user.password_hash);
    if (!valid)
      throw new AuthError("INVALID_CREDENTIALS", "Invalid credentials");

    if (!user.phone_verified)
      throw new AuthError(
        "ACCOUNT_NOT_VERIFIED",
        "Please verify your account first",
      );

    return user;
  },
};
