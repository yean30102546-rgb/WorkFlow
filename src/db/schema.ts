import { pgTable, uuid, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';

// Define the enum for user roles
export const roleEnum = pgEnum('user_role', ['OPERATOR', 'DRIVER', 'ADMIN']);

// Define the users table
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Using LINE User ID as primary key
  displayName: text('display_name').notNull(),
  pictureUrl: text('picture_url'),
  role: roleEnum('role').default('OPERATOR').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Define the enum for job status
export const statusEnum = pgEnum('job_status', ['PENDING', 'PICKED_UP', 'COMPLETED', 'CANCELLED']);

// Define the jobs table
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Operator Info
  operatorId: text('operator_id').notNull(),
  requestImageUrl: text('request_image_url'),
  
  // Driver Info
  driverId: text('driver_id'),
  successImageUrl: text('success_image_url'),
  
  // Job Details
  status: statusEnum('status').default('PENDING').notNull(),
  itemDetails: jsonb('item_details').notNull(),
  startPoint: text('start_point').default('Station A').notNull(),
  endPoint: text('end_point').default('Warehouse B').notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  pickedUpAt: timestamp('picked_up_at'),
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
