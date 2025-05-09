
/**
 * Main index file for fixed types - exports all standardized types to ensure consistency
 */

// Re-export all fixed types
export * from './User';
export * from './Auth';
export * from './Accessibility';
export * from './Webhook';
export * from './Campaign';
export * from './LaunchChecklist';
export * from './Compliance';
export * from './Message';
export * from './Bot';

// Type aliases with preferred naming
export type WebhookStatus = 'success' | 'failed' | 'pending';
export type UserRole = 'admin' | 'user';
export type ChecklistItemStatus = 'pending' | 'error' | 'completed' | 'warning' | 'in-progress';
