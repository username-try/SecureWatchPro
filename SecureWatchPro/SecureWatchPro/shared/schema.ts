import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const monitors = pgTable("monitors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  accessCode: text("access_code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  monitorId: integer("monitor_id").references(() => monitors.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  motionDetectionEnabled: boolean("motion_detection_enabled").default(false).notNull(),
  nightVisionEnabled: boolean("night_vision_enabled").default(false).notNull(),
  resolution: text("resolution").default("720p").notNull(),
  frameRate: integer("frame_rate").default(24).notNull(),
  roiX: real("roi_x").default(0.2),
  roiY: real("roi_y").default(0.2),
  roiWidth: real("roi_width").default(0.6),
  roiHeight: real("roi_height").default(0.6),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const motionEvents = pgTable("motion_events", {
  id: serial("id").primaryKey(),
  cameraId: integer("camera_id").references(() => cameras.id).notNull(),
  confidence: real("confidence").notNull(),
  boundingBoxX: real("bounding_box_x").notNull(),
  boundingBoxY: real("bounding_box_y").notNull(),
  boundingBoxWidth: real("bounding_box_width").notNull(),
  boundingBoxHeight: real("bounding_box_height").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMonitorSchema = createInsertSchema(monitors).omit({
  id: true,
  createdAt: true,
});

export const insertCameraSchema = createInsertSchema(cameras).omit({
  id: true,
  createdAt: true,
});

export const insertMotionEventSchema = createInsertSchema(motionEvents).omit({
  id: true,
  createdAt: true,
});

export const updateCameraSettingsSchema = createInsertSchema(cameras).omit({
  id: true,
  monitorId: true,
  createdAt: true,
});

export type InsertMonitor = z.infer<typeof insertMonitorSchema>;
export type InsertCamera = z.infer<typeof insertCameraSchema>;
export type InsertMotionEvent = z.infer<typeof insertMotionEventSchema>;
export type UpdateCameraSettings = z.infer<typeof updateCameraSettingsSchema>;

export type Monitor = typeof monitors.$inferSelect;
export type Camera = typeof cameras.$inferSelect;
export type MotionEvent = typeof motionEvents.$inferSelect;
