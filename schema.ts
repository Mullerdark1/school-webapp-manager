import { pgTable, text, serial, integer, boolean, timestamp, date, varchar, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
export * from "./models/auth";
import { users } from "./models/auth";

// === ENUMS ===
export const roleEnum = pgEnum("role", ["admin", "teacher", "student"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);
export const attendanceStatusEnum = pgEnum("attendance_status", ["present", "absent", "late"]);

// === TABLES ===

// Extend auth users with role
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: roleEnum("role").default("student").notNull(),
});

export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // Basic 1, JSS 1, etc.
  teacherId: varchar("teacher_id").references(() => users.id), // Class teacher
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  admissionNumber: text("admission_number").notNull().unique(),
  studentCode: text("student_code").notNull().unique(), // BDS001...
  gender: genderEnum("gender").notNull(),
  classId: integer("class_id").references(() => classes.id),
  admissionDate: date("admission_date").notNull(),
  dateOfBirth: date("date_of_birth").notNull(),
  parentName: text("parent_name").notNull(),
  parentPhone: text("parent_phone").notNull(),
  address: text("address").notNull(),
  profilePictureUrl: text("profile_picture_url"),
  userId: varchar("user_id").references(() => users.id), // Link to auth user if they log in
});

export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id),
  classId: integer("class_id").notNull().references(() => classes.id),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  recordedBy: varchar("recorded_by").references(() => users.id),
});

// === RELATIONS ===
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
  students: many(students),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  attendance: many(attendance),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  class: one(classes, {
    fields: [attendance.classId],
    references: [classes.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertClassSchema = createInsertSchema(classes).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true, studentCode: true }); // studentCode is auto-generated backend side usually, or client sends it? User said "auto-generated".
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true });
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true });

// === TYPES ===
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

// Custom Types
export type StudentWithClass = Student & { class: Class | null };
export type AttendanceRecord = Attendance & { student: Student };
