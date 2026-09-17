import { db } from './index.ts';
import { students } from './schema.ts';
import { eq } from 'drizzle-orm';

export interface UpsertStudentParams {
  uid?: string;
  id?: string;
  email: string;
  name?: string;
  avatar?: string;
  studentId?: string;
  department?: string;
  degree?: string;
  semester?: string;
  emergencyContact?: string;
  profileCompleted?: boolean;
  busData?: any;
}

export async function upsertStudentInPostgres(data: UpsertStudentParams) {
  try {
    const studentUid = data.uid || data.id || `usr-${Date.now()}`;
    const result = await db
      .insert(students)
      .values({
        id: studentUid,
        uid: studentUid,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        studentId: data.studentId,
        department: data.department,
        degree: data.degree,
        semester: data.semester,
        emergencyContact: data.emergencyContact,
        profileCompleted: data.profileCompleted ?? false,
        busData: data.busData,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: students.id,
        set: {
          email: data.email,
          name: data.name,
          avatar: data.avatar,
          studentId: data.studentId,
          department: data.department,
          degree: data.degree,
          semester: data.semester,
          emergencyContact: data.emergencyContact,
          profileCompleted: data.profileCompleted ?? false,
          busData: data.busData,
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database student upsert failed:', error);
    throw new Error('Failed to upsert student record in database', { cause: error });
  }
}

export async function getStudentFromPostgres(id: string) {
  try {
    const results = await db.select().from(students).where(eq(students.id, id)).limit(1);
    return results[0] || null;
  } catch (error) {
    console.error('Database student query failed:', error);
    throw new Error('Failed to query student from database', { cause: error });
  }
}
