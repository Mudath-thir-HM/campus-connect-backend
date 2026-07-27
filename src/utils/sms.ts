export async function sendSms(phoneNumber: string, message: string) {
  const isSandbox = process.env.AT_USERNAME === "sandbox";
  const url = isSandbox
    ? "https://api.sandbox.africastalking.com/version1/messaging"
    : "https://api.africastalking.com/version1/messaging/bulk";

  if (isSandbox) {
    const params = new URLSearchParams({
      username: process.env.AT_USERNAME!,
      to: phoneNumber,
      message,
      from: process.env.AT_SENDER_ID || "",
    });
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        apiKey: process.env.AT_API_KEY!,
      },
      body: params,
    });
    if (!res.ok) throw new Error(`SMS send failed: ${res.status}`);
    return res.json();
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      apiKey: process.env.AT_API_KEY!,
    },
    body: JSON.stringify({
      username: process.env.AT_USERNAME,
      phoneNumbers: [phoneNumber],
      message,
      senderId: process.env.AT_SENDER_ID || undefined,
    }),
  });
  if (!res.ok) throw new Error(`SMS send failed: ${res.status}`);
  return res.json();
}
