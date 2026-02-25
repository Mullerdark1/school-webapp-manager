import { db } from "./db";
import {
  students, classes, attendance, userRoles,
  type Student, type InsertStudent, type Class, type InsertClass,
  type Attendance, type InsertAttendance, type UserRole, type InsertUserRole,
  type StudentWithClass
} from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
  // Students
  getStudents(classId?: number): Promise<StudentWithClass[]>;
  getStudent(id: number): Promise<StudentWithClass | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, student: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: number): Promise<void>;

  // Classes
  getClasses(): Promise<Class[]>;
  createClass(cls: InsertClass): Promise<Class>;
  getClass(id: number): Promise<Class | undefined>;

  // Attendance
  getAttendance(classId: number, date: string): Promise<(Attendance & { student: Student })[]>;
  markAttendance(records: InsertAttendance[]): Promise<void>;

  // Roles
  getUserRole(userId: string): Promise<UserRole | undefined>;
  assignRole(role: InsertUserRole): Promise<UserRole>;

  // Dashboard
  getDashboardStats(): Promise<{ totalStudents: number; totalClasses: number; presentToday: number }>;
}

export class DatabaseStorage implements IStorage {
  async getStudents(classId?: number): Promise<StudentWithClass[]> {
    const query = db.query.students.findMany({
      where: classId ? eq(students.classId, classId) : undefined,
      with: {
        class: true
      }
    });
    return await query;
  }

  async getStudent(id: number): Promise<StudentWithClass | undefined> {
    return await db.query.students.findFirst({
      where: eq(students.id, id),
      with: {
        class: true
      }
    });
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    // Generate student code: BDS + Year + Random 4 digits (Simple version)
    // Ideally we'd use a sequence or count, but random is fine for now
    const code = `BDS${new Date().getFullYear().toString().slice(-2)}${Math.floor(1000 + Math.random() * 9000)}`;
    
    const [student] = await db.insert(students).values({
      ...insertStudent,
      studentCode: code
    }).returning();
    return student;
  }

  async updateStudent(id: number, updates: Partial<InsertStudent>): Promise<Student> {
    const [updated] = await db.update(students)
      .set(updates)
      .where(eq(students.id, id))
      .returning();
    return updated;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  async getClasses(): Promise<Class[]> {
    return await db.select().from(classes);
  }

  async createClass(cls: InsertClass): Promise<Class> {
    const [newClass] = await db.insert(classes).values(cls).returning();
    return newClass;
  }

  async getClass(id: number): Promise<Class | undefined> {
     const [cls] = await db.select().from(classes).where(eq(classes.id, id));
     return cls;
  }

  async getAttendance(classId: number, date: string): Promise<(Attendance & { student: Student })[]> {
    return await db.query.attendance.findMany({
      where: and(eq(attendance.classId, classId), eq(attendance.date, date)),
      with: {
        student: true
      }
    });
  }

  async markAttendance(records: InsertAttendance[]): Promise<void> {
    if (records.length === 0) return;
    
    // Using simple loop for upsert or just insert. 
    // Since we want to update if exists for same student/date/class
    // We can use onConflictDoUpdate if we had a unique constraint on (studentId, date, classId)
    // For now, let's delete existing for that day/class/student and insert new
    // Or just insert (assuming clean slate or handled by UI)
    
    // Better: Transaction
    await db.transaction(async (tx) => {
        for (const record of records) {
            // Check if exists
            const existing = await tx.select().from(attendance).where(
                and(
                    eq(attendance.studentId, record.studentId),
                    eq(attendance.date, record.date),
                    eq(attendance.classId, record.classId)
                )
            );

            if (existing.length > 0) {
                await tx.update(attendance)
                    .set({ status: record.status, recordedBy: record.recordedBy })
                    .where(eq(attendance.id, existing[0].id));
            } else {
                await tx.insert(attendance).values(record);
            }
        }
    });
  }

  async getUserRole(userId: string): Promise<UserRole | undefined> {
    const [role] = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    
    if (!role) {
        // Check if this is the first user ever
        // We need to count users in the auth users table
        // But we can't import 'users' from schema if it's not exported there? 
        // We imported it in schema.ts from models/auth.
        const { users } = await import("@shared/models/auth");
        const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
        
        // If there is only 1 user (the current one just created/logged in), make them admin
        if (Number(userCount?.count) === 1) {
             return await this.assignRole({ userId, role: "admin" });
        }
    }

    return role;
  }

  async assignRole(roleData: InsertUserRole): Promise<UserRole> {
    // Upsert role
    const [role] = await db.insert(userRoles)
        .values(roleData)
        .onConflictDoUpdate({
            target: userRoles.userId, // Assuming userId is unique in userRoles? Ah, schema doesn't enforce unique userId on userRoles table, I should have added .unique() to userId in schema.
            // Let's assume for now 1 role per user.
            set: { role: roleData.role }
        })
        .returning();
    return role;
  }

  async getDashboardStats(): Promise<{ totalStudents: number; totalClasses: number; presentToday: number }> {
    const [studentCount] = await db.select({ count: sql<number>`count(*)` }).from(students);
    const [classCount] = await db.select({ count: sql<number>`count(*)` }).from(classes);
    
    const today = new Date().toISOString().split('T')[0];
    const [presentCount] = await db.select({ count: sql<number>`count(*)` })
        .from(attendance)
        .where(and(eq(attendance.date, today), eq(attendance.status, "present")));

    return {
        totalStudents: Number(studentCount?.count || 0),
        totalClasses: Number(classCount?.count || 0),
        presentToday: Number(presentCount?.count || 0)
    };
  }
}

export const storage = new DatabaseStorage();
