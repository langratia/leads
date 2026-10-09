import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  doublePrecision,
  numeric,
  uuid,
} from "drizzle-orm/pg-core";

export const leads = pgTable("leads", {
  id: uuid("id").defaultRandom().primaryKey(),
  businessName: text("business_name").notNull(),
  category: text("category"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  email: text("email"),
  website: text("website"),
  address: text("address"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  placeId: text("place_id"),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count"),
  interestedProduct: text("interested_product"),
  leadSource: text("lead_source").default("Website").notNull(),
  status: text("status").default("New").notNull(),
  priority: text("priority").default("Medium").notNull(),
  leadScore: integer("lead_score").default(0).notNull(),
  estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 }),
  assignedTo: text("assigned_to"),
  tags: text("tags").array().default([]).notNull(),
  notes: text("notes"),
  nextFollowupDate: text("next_followup_date"),
  nextFollowupTime: text("next_followup_time"),
  followupMethod: text("followup_method"),
  createdBy: text("created_by"),
  convertedAt: timestamp("converted_at", { withTimezone: true }),
  customerId: uuid("customer_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const leadActivities = pgTable("lead_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id")
    .references(() => leads.id, { onDelete: "cascade" })
    .notNull(),
  activityType: text("activity_type").notNull(),
  description: text("description"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const leadFollowups = pgTable("lead_followups", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id")
    .references(() => leads.id, { onDelete: "cascade" })
    .notNull(),
  followupDate: text("followup_date").notNull(),
  followupTime: text("followup_time"),
  method: text("method"),
  notes: text("notes"),
  assignedTo: text("assigned_to"),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  businessName: text("business_name").notNull(),
  category: text("category"),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  address: text("address"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  interestedProduct: text("interested_product"),
  estimatedValue: numeric("estimated_value", { precision: 12, scale: 2 }),
  convertedBy: text("converted_by"),
  convertedAt: timestamp("converted_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const emailThreads = pgTable("email_threads", {
  id: uuid("id").defaultRandom().primaryKey(),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  subject: text("subject"),
  participantEmail: text("participant_email").notNull(),
  status: text("status").default("OPEN").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const emailMessages = pgTable("email_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  threadId: uuid("thread_id")
    .references(() => emailThreads.id, { onDelete: "cascade" })
    .notNull(),
  direction: text("direction").notNull(),
  fromEmail: text("from_email").notNull(),
  toEmail: text("to_email").notNull(),
  bodyText: text("body_text").notNull(),
  bodyHtml: text("body_html"),
  messageId: text("message_id"),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const inquiries = pgTable("inquiries", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  category: text("category"),
  projectDescription: text("project_description"),
  ndaRequested: boolean("nda_requested").default(false).notNull(),
  source: text("source").default("Website").notNull(),
  status: text("status").default("NEW_LEAD").notNull(),
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  date: text("date").notNull(),
  time: text("time").notNull(),
  notes: text("notes"),
  status: text("status").default("CONFIRMED").notNull(),
  meetLink: text("meet_link"),
  outcome: text("outcome"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const searchLogs = pgTable("search_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  query: text("query").notNull(),
  category: text("category"),
  resultsCount: integer("results_count").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
