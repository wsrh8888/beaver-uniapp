/**
 * @description: 通知已读游标表结构定义
 * 移动端SQLite版本
 */

import type { NotificationReadCursorTable } from '@/types/database';

/**
 * @description: 通知已读游标表创建SQL
 */
export const NOTIFICATION_READS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS notification_reads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    version INTEGER DEFAULT 0,
    last_read_at INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    UNIQUE(user_id, category)
  );
`;

/**
 * @description: 通知已读游标表索引SQL
 */
export const NOTIFICATION_READS_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);
  CREATE INDEX IF NOT EXISTS idx_notification_reads_category ON notification_reads(category);
`;

/**
 * @description: 通知已读游标表字段名常量
 */
export const NOTIFICATION_READS_FIELDS = {
  ID: 'id',
  USER_ID: 'user_id',
  CATEGORY: 'category',
  VERSION: 'version',
  LAST_READ_AT: 'last_read_at',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;
