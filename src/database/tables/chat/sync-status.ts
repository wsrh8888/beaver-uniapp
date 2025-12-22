/**
 * @description: 聊天同步状态表结构定义
 * 移动端SQLite版本
 */

import type { ChatSyncStatusTable } from '@/types/database';

/**
 * @description: 聊天同步状态表创建SQL
 */
export const CHAT_SYNC_STATUS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS chat_sync_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT NOT NULL,
    module TEXT NOT NULL,
    seq INTEGER DEFAULT 0,
    version INTEGER DEFAULT 0,
    updated_at INTEGER,
    UNIQUE(conversation_id, module)
  );
`;

/**
 * @description: 聊天同步状态表索引SQL
 * 由于有UNIQUE约束，可能不需要额外索引
 */
export const CHAT_SYNC_STATUS_INDEX_SQL = `
  -- 视情况需要而定，目前可能不需要额外索引
`;

/**
 * @description: 聊天同步状态表字段名常量
 */
export const CHAT_SYNC_STATUS_FIELDS = {
  ID: 'id',
  CONVERSATION_ID: 'conversation_id',
  MODULE: 'module',
  SEQ: 'seq',
  VERSION: 'version',
  UPDATED_AT: 'updated_at',
} as const;

