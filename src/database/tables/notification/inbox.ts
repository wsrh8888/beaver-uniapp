/**
 * @description: 通知收件箱表结构定义
 * 移动端SQLite版本
 */

import type { NotificationInboxTable } from '@/types/database';

/**
 * @description: 通知收件箱表创建SQL
 */
export const NOTIFICATION_INBOXES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS notification_inboxes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    category TEXT NOT NULL,
    version INTEGER DEFAULT 0,
    is_read INTEGER DEFAULT 0,
    read_at INTEGER,
    status INTEGER DEFAULT 1,
    is_deleted INTEGER DEFAULT 0,
    silent INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    UNIQUE(user_id, event_id)
  );
`;

/**
 * @description: 通知收件箱表索引SQL
 */
export const NOTIFICATION_INBOXES_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_notification_inboxes_user_id ON notification_inboxes(user_id);
  CREATE INDEX IF NOT EXISTS idx_notification_inboxes_event_id ON notification_inboxes(event_id);
  CREATE INDEX IF NOT EXISTS idx_notification_inboxes_category ON notification_inboxes(category);
  CREATE INDEX IF NOT EXISTS idx_notification_inboxes_is_read ON notification_inboxes(is_read);
  CREATE INDEX IF NOT EXISTS idx_notification_inboxes_status ON notification_inboxes(status);
`;

/**
 * @description: 通知收件箱表字段名常量
 */
export const NOTIFICATION_INBOXES_FIELDS = {
  ID: 'id',
  USER_ID: 'user_id',
  EVENT_ID: 'event_id',
  EVENT_TYPE: 'event_type',
  CATEGORY: 'category',
  VERSION: 'version',
  IS_READ: 'is_read',
  READ_AT: 'read_at',
  STATUS: 'status',
  IS_DELETED: 'is_deleted',
  SILENT: 'silent',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;

