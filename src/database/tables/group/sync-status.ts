/**
 * @description: 群组同步状态表结构定义
 * 移动端SQLite版本
 */

import type { GroupSyncStatusTable } from '@/types/database';

/**
 * @description: 群组同步状态表创建SQL
 */
export const GROUP_SYNC_STATUS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS group_sync_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id TEXT NOT NULL,
    module TEXT NOT NULL,
    version INTEGER DEFAULT 0,
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    UNIQUE(group_id, module)
  );
`;

/**
 * @description: 群组同步状态表索引SQL
 */
export const GROUP_SYNC_STATUS_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_group_sync_status_group_id ON group_sync_status(group_id);
  CREATE INDEX IF NOT EXISTS idx_group_sync_status_module ON group_sync_status(module);
`;

/**
 * @description: 群组同步状态表字段名常量
 */
export const GROUP_SYNC_STATUS_FIELDS = {
  ID: 'id',
  GROUP_ID: 'group_id',
  MODULE: 'module',
  VERSION: 'version',
  UPDATED_AT: 'updated_at',
} as const;

