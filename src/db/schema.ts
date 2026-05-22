import { pgTable, uuid, text, timestamp, pgEnum, jsonb } from 'drizzle-orm/pg-core';

// Define the enum for job status
export const statusEnum = pgEnum('job_status', ['PENDING', 'PICKED_UP', 'COMPLETED', 'CANCELLED']);

// Define the jobs table
export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  operatorId: text('operator_id').notNull(),
  driverId: text('driver_id'),
  status: statusEnum('status').default('PENDING').notNull(),
  itemDetails: jsonb('item_details').notNull(),
  startPoint: text('start_point').default('Station A').notNull(),
  endPoint: text('end_point').default('Warehouse B').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
