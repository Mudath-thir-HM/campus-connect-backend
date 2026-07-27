export interface User {
  id: string;
  full_name: string;
  matric_number: string;
  email: string;
  phone: string;
  password_hash: string;
  department: string | null;
  level: string | null;
  status: string;
  profile_picture_url: string | null;
  phone_verified: boolean;
  is_premium: boolean;
  priority_sms_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export type PublicUser = Omit<User, "password_hash">;

export interface OtpVerification {
  id: string;
  user_id: string;
  code: string;
  purpose: "signup" | "login" | "password_reset";
  expires_at: Date;
  verified_at: Date | null;
  created_at: Date;
}
