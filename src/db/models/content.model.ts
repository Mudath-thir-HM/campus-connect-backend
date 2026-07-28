export interface NewsPost {
  id: string;
  user_id: string;
  title: string;
  body: string;
  created_at: string;
}

export interface Event {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  venue: string | null;
  event_date: string;
  created_at: string;
}
