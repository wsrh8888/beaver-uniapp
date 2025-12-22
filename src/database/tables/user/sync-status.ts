/**
 * @description: 用户同步状态表结构定义
 * 移动端SQLite版本
 */

import type { UserSyncStatusTable } from '@/types/database';

/**
 * @description: 用户同步状态表创建SQL
 */
export const USER_SYNC_STATUS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS user_sync_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    user_version INTEGER DEFAULT 0,
    last_sync_time INTEGER DEFAULT 0,
    updated_at INTEGER
  );
`;

/**
 * @description: 用户同步状态表索引SQL
 * 通常只有一条记录，无需索引
 */
export const USER_SYNC_STATUS_INDEX_SQL = `
  -- 用户同步状态表数据量极小，无需索引
`;

/**
 * @description: 用户同步状态表字段名常量
 */
export const USER_SYNC_STATUS_FIELDS = {
  ID: 'id',
  USER_ID: 'user_id',
  USER_VERSION: 'user_version',
  LAST_SYNC_TIME: 'last_sync_time',
  UPDATED_AT: 'updated_at',
} as const;
