import {
  pgTable,
  text,
  serial,
  integer,
  numeric,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Schema for user accounts (if needed in future)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Schema for bill calculations
export const calculations = pgTable("calculations", {
  id: serial("id").primaryKey(),
  fromDate: timestamp("from_date").notNull(),
  toDate: timestamp("to_date").notNull(),
  mainMeterReading: numeric("main_meter_reading").notNull(),
  abcdMeterReading: numeric("abcd_meter_reading").notNull(),
  xyzMeterReading: numeric("xyz_meter_reading").notNull(),
  okbdMeterReading: numeric("okbd_meter_reading").notNull(),
  billAmount: numeric("bill_amount").notNull(),
  commonUsage: numeric("common_usage").notNull(),
  abcdShare: numeric("abcd_share").notNull(),
  xyzShare: numeric("xyz_share").notNull(),
  okbdShare: numeric("okbd_share").notNull(),
  commonShare: numeric("common_share").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  meterImages: jsonb("meter_images").$type<MeterImages>(),
  billImage: text("bill_image"),
});

export const insertCalculationSchema = createInsertSchema(calculations).omit({
  id: true,
  createdAt: true,
  commonUsage: true,
  abcdShare: true,
  xyzShare: true,
  okbdShare: true,
  commonShare: true,
});

export const calculationFormSchema = z.object({
  fromDate: z.date(),
  toDate: z.date(),
  mainMeterReading: z.number().positive("Main meter reading must be positive"),
  abcdMeterReading: z
    .number()
    .nonnegative("ABCD meter reading cannot be negative"),
  xyzMeterReading: z
    .number()
    .nonnegative("XYZ meter reading cannot be negative"),
  okbdMeterReading: z
    .number()
    .nonnegative("OKBD meter reading cannot be negative"),
  billAmount: z.number().positive("Bill amount must be positive"),
  meterImages: z
    .object({
      mainMeter: z.string().optional(),
      abcdMeter: z.string().optional(),
      xyzMeter: z.string().optional(),
      okbdMeter: z.string().optional(),
    })
    .optional(),
  billImage: z.string().optional(),
});

export type MeterImages = {
  mainMeter?: string;
  abcdMeter?: string;
  xyzMeter?: string;
  okbdMeter?: string;
};

export type CalculationForm = z.infer<typeof calculationFormSchema>;
export type InsertCalculation = z.infer<typeof insertCalculationSchema>;
export type Calculation = typeof calculations.$inferSelect;

// Schema for calculation results
export type CalculationResult = {
  mainMeter: number;
  abcdMeter: number;
  xyzMeter: number;
  okbdMeter: number;
  billAmount: number;
  commonUsage: number;
  abcdShare: number;
  xyzShare: number;
  okbdShare: number;
  commonShare: number;
  commonSharePerPerson: number;
  abcdPercent: number;
  xyzPercent: number;
  okbdPercent: number;
  commonPercent: number;
  fromDate: Date;
  toDate: Date;
  id?: number;
  createdAt?: Date;
  meterImages?: MeterImages;
  billImage?: string;
};
