export function toIso(date: Date | string): string {
  return new Date(date).toISOString();
}
