import { pgTable, text, timestamp, integer, boolean, uuid, varchar, index } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'), // Nullable for SSO-only users
  name: varchar('name', { length: 255 }).notNull(),
  skoolId: varchar('skool_id', { length: 255 }).unique(), // For Skool SSO integration
  profilePicture: text('profile_picture'),
  emailVerified: boolean('email_verified').default(false).notNull(),

  // User profile fields from existing UserProfile type
  role: varchar('role', { length: 255 }),
  focus: text('focus').array(),
  services: text('services').array(),
  topics: text('topics').array(),
  avatarInitial: varchar('avatar_initial', { length: 2 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastLogin: timestamp('last_login')
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
  skoolIdIdx: index('skool_id_idx').on(table.skoolId)
}));

// Sessions table for managing active sessions
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  refreshToken: text('refresh_token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  refreshExpiresAt: timestamp('refresh_expires_at').notNull(),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('session_user_id_idx').on(table.userId),
  tokenIdx: index('session_token_idx').on(table.token)
}));

// Password reset tokens table
export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('reset_token_user_id_idx').on(table.userId),
  tokenIdx: index('reset_token_idx').on(table.token)
}));

// Email verification tokens table
export const emailVerificationTokens = pgTable('email_verification_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('verification_token_user_id_idx').on(table.userId),
  tokenIdx: index('verification_token_idx').on(table.token)
}));

// Login attempts table for rate limiting
export const loginAttempts = pgTable('login_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),
  successful: boolean('successful').notNull(),
  attemptedAt: timestamp('attempted_at').defaultNow().notNull()
}, (table) => ({
  emailIdx: index('login_attempt_email_idx').on(table.email),
  ipIdx: index('login_attempt_ip_idx').on(table.ipAddress),
  attemptedAtIdx: index('login_attempt_timestamp_idx').on(table.attemptedAt)
}));

// CRM Leads table (migrate from localStorage)
export const crmLeads = pgTable('crm_leads', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessId: varchar('business_id', { length: 255 }).notNull(),

  // Business data (denormalized for simplicity)
  businessName: varchar('business_name', { length: 255 }).notNull(),
  businessIndustry: varchar('business_industry', { length: 255 }),
  businessLocation: varchar('business_location', { length: 255 }),
  businessPhone: varchar('business_phone', { length: 50 }),
  businessEmail: varchar('business_email', { length: 255 }),
  businessWebsite: text('business_website'),

  // CRM fields
  status: varchar('status', { length: 50 }).notNull().default('New'), // New, Contacted, Meeting, Proposal, Won, Lost
  priority: varchar('priority', { length: 50 }).notNull().default('Medium'), // Low, Medium, High
  tags: text('tags').array(),
  notes: text('notes'),

  nextFollowUpAt: timestamp('next_follow_up_at'),
  lastContactedAt: timestamp('last_contacted_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  userIdIdx: index('crm_lead_user_id_idx').on(table.userId),
  statusIdx: index('crm_lead_status_idx').on(table.status),
  nextFollowUpIdx: index('crm_lead_follow_up_idx').on(table.nextFollowUpAt)
}));

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type NewEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type NewLoginAttempt = typeof loginAttempts.$inferInsert;
export type CrmLead = typeof crmLeads.$inferSelect;
export type NewCrmLead = typeof crmLeads.$inferInsert;
