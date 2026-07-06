"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ContactForm(): JSX.Element {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    await new Promise((resolve) => setTimeout(resolve, 800));
    setStatus("sent");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  if (status === "sent") {
    return (
      <div className="rounded-lg border border-border bg-paper p-8 text-center">
        <h3 className="font-serif text-2xl font-medium text-ink">
          Message sent
        </h3>
        <p className="mt-3 text-muted-foreground">
          Thank you for reaching out. We will respond within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-paper p-6"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="subject" className="block text-sm font-medium text-ink">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          required
          value={form.subject}
          onChange={handleChange}
          className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="">Select a subject</option>
          <option value="order">Order inquiry</option>
          <option value="product">Product question</option>
          <option value="press">Press & collaborations</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="mt-6">
        <label htmlFor="message" className="block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          value={form.message}
          onChange={handleChange}
          className="mt-2 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending..." : "Send message"}
        </Button>
      </div>
    </form>
  );
}
