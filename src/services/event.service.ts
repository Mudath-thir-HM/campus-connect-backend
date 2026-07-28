import { eventRepository } from "../repositories/event.repository";
import { AuthError } from "./auth.service";

export const eventService = {
  async create(
    userId: string,
    title: string,
    description: string | null,
    venue: string | null,
    eventDate: string,
  ) {
    return eventRepository.create(
      userId,
      title,
      description,
      venue,
      new Date(eventDate),
    );
  },

  async list(limit: number, offset: number) {
    const events = await eventRepository.list(limit, offset);
    return Promise.all(
      events.map(async (e) => ({
        ...e,
        registration_count: await eventRepository.registrationCount(e.id),
      })),
    );
  },

  async register(userId: string, eventId: string) {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new AuthError("EVENT_NOT_FOUND", "Event not found");

    const already = await eventRepository.isRegistered(eventId, userId);
    if (already)
      throw new AuthError(
        "ALREADY_REGISTERED",
        "You're already registered for this event",
      );

    await eventRepository.register(eventId, userId);
    return { message: "Registered for event" };
  },
};
