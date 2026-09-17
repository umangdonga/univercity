import { pgTable, serial, text, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  name: text('name'),
  avatar: text('avatar'),
  studentId: text('student_id'),
  department: text('department'),
  degree: text('degree'),
  semester: text('semester'),
  emergencyContact: text('emergency_contact'),
  profileCompleted: boolean('profile_completed').default(false),
  busData: jsonb('bus_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const students = pgTable('students', {
  id: text('id').primaryKey(),
  uid: text('uid'),
  email: text('email').notNull(),
  name: text('name'),
  avatar: text('avatar'),
  studentId: text('student_id'),
  department: text('department'),
  degree: text('degree'),
  semester: text('semester'),
  emergencyContact: text('emergency_contact'),
  profileCompleted: boolean('profile_completed').default(false),
  busData: jsonb('bus_data'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const busPasses = pgTable('bus_passes', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').references(() => users.uid),
  studentName: text('student_name'),
  passNumber: text('pass_number').notNull(),
  routeNumber: text('route_number'),
  busNumber: text('bus_number'),
  pickupLocation: text('pickup_location'),
  dropLocation: text('drop_location'),
  validity: text('validity'),
  status: text('status').default('Active'),
  createdAt: timestamp('created_at').defaultNow(),
});
