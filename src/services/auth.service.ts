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
    if (!input.full_name || input.full_name.trim().length < 8) {
      throw new AuthError(
        "INVALID_FULL_NAME",
        "Full name must be at least 8 characters",
      );
    }

    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new AuthError(
        "INVALID_EMAIL",
        "Please enter a valid email address",
      );
    }

    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeNigerianPhone(input.phone);
    } catch {
      throw new AuthError(
        "INVALID_PHONE",
        "Please enter a valid Nigerian phone number",
      );
    } // normalize before anything else touches it

    if (
      !input.password ||
      input.password.length < 8 ||
      !/[A-Z]/.test(input.password) ||
      !/[a-z]/.test(input.password) ||
      !/[0-9]/.test(input.password)
    ) {
      throw new AuthError(
        "INVALID_PASSWORD",
        "Password must be at least 8 characters and include uppercase, lowercase, and a number",
      );
    }

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

    // Fire-and-forget: don't block registration on external delivery
    Promise.allSettled([
      this.issueAndSendOtp(user.id, user.email, user.phone, "signup"),
      notificationService.notify(
        user.id,
        "welcome",
        "Welcome!",
        "Welcome to Campus Connect. Complete your profile setup to get started.",
        null,
      ),
    ]).catch((err) =>
      console.error("[register] background tasks failed:", err),
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

  async resendOtp(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AuthError("USER_NOT_FOUND", "User not found");
    }

    await this.issueAndSendOtp(user.id, user.email, user.phone, "signup");

    return { message: "OTP resent successfully" };
  },

  async verifyOtp(userId: string, code: string) {
    const otp = await otpRepository.findLatestValid(userId, "signup");
    if (!otp || otp.code !== code) throw new Error("Invalid or expired OTP");

    await otpRepository.markVerified(otp.id);
    await userRepository.markPhoneVerified(userId);

    return { message: "Phone verified successfully" };
  },

  async login(email: string, password: string) {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AuthError(
        "INVALID_EMAIL",
        "Please enter a valid email address",
      );
    }

    if (!password || password.length < 8) {
      throw new AuthError(
        "INVALID_PASSWORD",
        "Password must be at least 8 characters",
      );
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AuthError("INVALID_EMAIL", "Email not found");
    }

    const valid = await Bun.password.verify(password, user.password_hash);
    if (!valid) {
      throw new AuthError("INVALID_PASSWORD", "Incorrect password");
    }

    if (!user.phone_verified) {
      throw new AuthError(
        "ACCOUNT_NOT_VERIFIED",
        "Please verify your account first",
      );
    }

    return user;
  },
};
