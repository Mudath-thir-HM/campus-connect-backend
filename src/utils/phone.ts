// src/utils/phone.ts
export function normalizeNigerianPhone(input: string): string {
  const digits = input.replace(/\D/g, ""); // strip spaces, dashes, parens

  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`; // e.g. "8100976947" with no leading 0

  throw new Error("Invalid Nigerian phone number");
}
