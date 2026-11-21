import { index, pgTable, primaryKey, text, timestamp, boolean, uuid, unique } from "drizzle-orm/pg-core";
import type { Slot, Style, Weather } from "../features/styling/engine";

const time = (name: string) => timestamp(name, { withTimezone: true });

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  preferredStyle: text("preferred_style").$type<Style>().default("casual").notNull(),
  preferredWeather: text("preferred_weather").$type<Weather>().default("tropical").notNull(),
  createdAt: time("created_at").defaultNow().notNull(),
  updatedAt: time("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: time("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: time("created_at").defaultNow().notNull(),
  updatedAt: time("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
}, table => [index("session_user_idx").on(table.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: time("access_token_expires_at"),
  refreshTokenExpiresAt: time("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: time("created_at").defaultNow().notNull(),
  updatedAt: time("updated_at").defaultNow().notNull(),
}, table => [index("account_user_idx").on(table.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: time("expires_at").notNull(),
  createdAt: time("created_at").defaultNow().notNull(),
  updatedAt: time("updated_at").defaultNow().notNull(),
}, table => [index("verification_identifier_idx").on(table.identifier)]);

export const wardrobe = pgTable("wardrobe_item", {
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  id: uuid("id").notNull(),
  name: text("name").notNull(),
  slot: text("slot").$type<Slot>().notNull(),
  color: text("color").notNull(),
  styles: text("styles").array().$type<Style[]>().notNull(),
  weather: text("weather").array().$type<Weather[]>().notNull(),
  createdAt: time("created_at").defaultNow().notNull(),
}, table => [primaryKey({ columns: [table.userId, table.id] })]);

export const savedOutfit = pgTable("saved_outfit", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  itemIds: uuid("item_ids").array().notNull(),
  style: text("style").$type<Style>().notNull(),
  weather: text("weather").$type<Weather>().notNull(),
  feedback: text("feedback").$type<"worn" | "skipped">(),
  note: text("note").default("").notNull(),
  createdAt: time("created_at").defaultNow().notNull(),
}, table => [unique("saved_outfit_selection_unique").on(table.userId, table.style, table.weather, table.itemIds)]);
