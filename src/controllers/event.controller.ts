import { eventService } from "../services/event.service";

export const eventController = {
  create: async ({ body, currentUser }: any) =>
    eventService.create(
      currentUser.id,
      body.title,
      body.description ?? null,
      body.venue ?? null,
      body.event_date,
    ),
  list: async ({ query }: any) =>
    eventService.list(Number(query.limit ?? 20), Number(query.offset ?? 0)),
  register: async ({ params, currentUser }: any) =>
    eventService.register(currentUser.id, params.id),
};
