export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  sms_sent_at: string | null;
  created_at: string;
}
