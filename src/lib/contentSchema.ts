import { z } from "zod";

export const EventSchema = z.object({
  title: z.string().trim().min(1, "Required").max(60),
  date: z.string().min(1, "Pick a date"),
  time: z.string().max(20),
  venue: z.string().trim().max(120),
  address: z.string().trim().max(200),
  mapUrl: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must start with http(s)://"),
  dressCode: z.string().trim().max(80),
});

export const FaqSchema = z.object({
  q: z.string().trim().min(1, "Required").max(120),
  a: z.string().trim().min(1, "Required").max(400),
});

export const MAX_EVENTS = 6;
export const MAX_FAQ = 6;

export const ContentSchema = z.object({
  language: z.enum(["en", "ur"]),
  bismillah: z.boolean(),
  headline: z.string().trim().max(80),
  host1: z.string().trim().min(1, "Required").max(40),
  host2: z.string().trim().max(40),
  message: z.string().trim().max(400),
  family1: z.string().trim().max(120),
  family2: z.string().trim().max(120),
  events: z.array(EventSchema).min(1, "Add at least one event").max(MAX_EVENTS),
  faq: z.array(FaqSchema).max(MAX_FAQ),
  closing: z.string().trim().max(120),
  rsvpEnabled: z.boolean(),
  contactPhone: z.string().trim().max(20),
});

export type InviteContent = z.infer<typeof ContentSchema>;
export type InviteEvent = z.infer<typeof EventSchema>;
