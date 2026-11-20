"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import type { ActionState } from "@/components/ui/form";

const schema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(254),
  topic: z.enum(["general", "feedback", "content-error", "workshops", "premium-waitlist"]),
  message: z.string().trim().min(10, "Message is too short").max(5000),
  website: z.string().max(0).optional(), // honeypot
});

export async function sendContact(_: ActionState, formData: FormData): Promise<ActionState> {
  if (!rateLimit(`contact:${await clientIp()}`, 5, 60 * 60_000)) return { message: "Too many messages. Please try again later." };
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: parsed.error.issues[0]?.message ?? "Please check the form." };
  const { website: _hp, ...data } = parsed.data;
  void _hp;
  await db.insert(contactMessages).values(data);
  return { ok: true, message: "Thanks — your message has been received." };
}
