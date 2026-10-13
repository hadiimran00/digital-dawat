import { z } from "zod";

// No eval-based fast path: the site's Content-Security-Policy does not allow evaluating strings as code.
z.config({ jitless: true });
import { isOurPhoto } from "./photos";

/** A customer photo: empty, or a URL in our own storage bucket. */
const Photo = z.string().trim().max(400).refine((v) => v === "" || isOurPhoto(v), "Please upload the photo again").default("");

export const EventSchema = z.object({
  title: z.string().trim().min(1, "Give this event a name, for example Mehndi").max(60),
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
  photo: Photo,
});

export const FaqSchema = z.object({
  q: z.string().trim().min(1, "Type the question, or remove it").max(120),
  a: z.string().trim().min(1, "Type the answer, or remove the question").max(400),
});

/** One moment in the day's programme, e.g. 19:00 Nikkah. */
export const TimelineSchema = z.object({
  time: z.string().trim().max(10),
  title: z.string().trim().min(1, "Type what happens, or remove this line").max(40),
  note: z.string().trim().max(120),
});

/** A family member guests can call. The phone is optional. */
export const MemberSchema = z.object({
  name: z.string().trim().min(1, "Type a name, or remove this person").max(60),
  phone: z
    .string()
    .trim()
    .max(20)
    .refine((v) => v === "" || /^\+?[0-9 ()-]{7,20}$/.test(v), "Use digits only, e.g. +92 300 0000000"),
});

export const MAX_MEMBERS = 5;
export const MAX_EVENTS = 6;
export const MAX_FAQ = 6;
export const MAX_TIMELINE = 8;

export const ContentSchema = z.object({
  language: z.enum(["en", "ur"]),
  bismillah: z.boolean(),
  headline: z.string().trim().max(80),
  host1: z.string().trim().min(1, "Type the first name shown on the invitation").max(40),
  host2: z.string().trim().max(40),
  message: z.string().trim().max(400),
  family1: z.string().trim().max(120),
  family2: z.string().trim().max(120),
  side1Label: z.string().trim().max(30).default(""),
  side2Label: z.string().trim().max(30).default(""),
  members1: z.array(MemberSchema).max(MAX_MEMBERS).default([]),
  members2: z.array(MemberSchema).max(MAX_MEMBERS).default([]),
  events: z.array(EventSchema).min(1, "Add at least one event").max(MAX_EVENTS),
  faq: z.array(FaqSchema).max(MAX_FAQ),
  /** the programme of the day (optional; shown by the designs that have a timeline screen) */
  timeline: z.array(TimelineSchema).max(MAX_TIMELINE).default([]),
  closing: z.string().trim().max(120),
  rsvpEnabled: z.boolean(),
  contactPhone: z.string().trim().max(20),
  coverPhoto: Photo,
  couplePhoto: Photo,
});

export type InviteContent = z.infer<typeof ContentSchema>;
export type InviteEvent = z.infer<typeof EventSchema>;
export type FamilyMember = z.infer<typeof MemberSchema>;
export type TimelineItem = z.infer<typeof TimelineSchema>;
