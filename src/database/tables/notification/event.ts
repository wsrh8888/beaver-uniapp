/**
 * @description: 通知事件主表结构定义
 * 移动端SQLite版本
 */

import type { NotificationEventTable } from '@/types/database';

/**
 * @description: 通知事件主表创建SQL
 */
export const NOTIFICATION_EVENTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS notification_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    category TEXT NOT NULL,
    version INTEGER DEFAULT 0,
    from_user_id TEXT,
    target_id TEXT,
    target_type TEXT NOT NULL,
    payload TEXT,
    priority INTEGER DEFAULT 5,
    status INTEGER DEFAULT 1,
    dedup_hash TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  );
`;

/**
 * @description: 通知事件主表索引SQL
 */
export const NOTIFICATION_EVENTS_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_notification_events_event_id ON notification_events(event_id);
  CREATE INDEX IF NOT EXISTS idx_notification_events_event_type ON notification_events(event_type);
  CREATE INDEX IF NOT EXISTS idx_notification_events_category ON notification_events(category);
  CREATE INDEX IF NOT EXISTS idx_notification_events_from_user_id ON notification_events(from_user_id);
  CREATE INDEX IF NOT EXISTS idx_notification_events_target_id ON notification_events(target_id);
`;

/**
 * @description: 通知事件主表字段名常量
 */
export const NOTIFICATION_EVENTS_FIELDS = {
  ID: 'id',
  EVENT_ID: 'event_id',
  EVENT_TYPE: 'event_type',
  CATEGORY: 'category',
  VERSION: 'version',
  FROM_USER_ID: 'from_user_id',
  TARGET_ID: 'target_id',
  TARGET_TYPE: 'target_type',
  PAYLOAD: 'payload',
  PRIORITY: 'priority',
  STATUS: 'status',
  DEDUP_HASH: 'dedup_hash',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;

