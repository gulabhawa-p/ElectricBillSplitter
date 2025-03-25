import { pgTable, text, serial, integer, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping the original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Bill calculation schema
export const billCalculations = pgTable("billCalculations", {
  id: serial("id").primaryKey(),
  calculationDate: timestamp("calculationDate").notNull().defaultNow(),
  billingDate: date("billingDate").notNull(),
  mainMeterReading: numeric("mainMeterReading").notNull(),
  abcdMeterReading: numeric("abcdMeterReading").notNull(),
  xyzMeterReading: numeric("xyzMeterReading").notNull(),
  okbdMeterReading: numeric("okbdMeterReading").notNull(),
  billAmount: numeric("billAmount").notNull(),
  commonUsage: numeric("commonUsage").notNull(),
  abcdShare: numeric("abcdShare").notNull(),
  xyzShare: numeric("xyzShare").notNull(),
  okbdShare: numeric("okbdShare").notNull(),
  commonShare: numeric("commonShare").notNull(),
  photoUrls: text("photoUrls"),
});

// Photo uploads schema
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  calculationId: integer("calculationId").notNull(),
  photoUrl: text("photoUrl").notNull(),
  uploadDate: timestamp("uploadDate").notNull().defaultNow(),
});

// Insert schema for bill calculations
export const insertBillCalculationSchema = createInsertSchema(billCalculations).omit({
  id: true,
  calculationDate: true,
  commonUsage: true,
  abcdShare: true,
  xyzShare: true,
  okbdShare: true,
  commonShare: true,
});

// Insert schema for photos
export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadDate: true,
});

// Form validation schema
export const billFormSchema = z.object({
  billingDate: z.string().min(1, "Billing date is required"),
  mainMeterReading: z.number().positive("Must be a positive number"),
  abcdMeterReading: z.number().positive("Must be a positive number"),
  xyzMeterReading: z.number().positive("Must be a positive number"),
  okbdMeterReading: z.number().positive("Must be a positive number"),
  billAmount: z.number().positive("Must be a positive number"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBillCalculation = z.infer<typeof insertBillCalculationSchema>;
export type BillCalculation = typeof billCalculations.$inferSelect;

export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;

export type BillFormData = z.infer<typeof billFormSchema>;

// Keeping the original user schema
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
