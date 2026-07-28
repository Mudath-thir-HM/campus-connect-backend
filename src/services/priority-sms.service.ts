import { messageRepository } from "../repositories/message.repository";
import { sendSms } from "../utils/sms";

const THRESHOLD_MINUTES = 40;

export const prioritySmsService = {
  async runCheck() {
    const pending =
      await messageRepository.findUnreadPastThreshold(THRESHOLD_MINUTES);

    console.log(
      `[priority-sms] found ${pending.length} unread message(s) past threshold`,
    );

    for (const msg of pending) {
      try {
        await sendSms(
          msg.recipient_phone,
          `You have an unread message from ${msg.sender_name} on Campus Connect: "${msg.body.slice(0, 60)}"`,
        );
        await messageRepository.markSmsSent(msg.id);
        console.log(
          `[priority-sms] sent SMS for message ${msg.id} to ${msg.recipient_phone}`,
        );
      } catch (err) {
        // one failure shouldn't stop the rest of the batch — same Promise.allSettled principle as OTP dispatch
        console.error(
          `[priority-sms] failed to send for message ${msg.id}:`,
          err,
        );
      }
    }
  },
};
