/**
 * @description: 用户会话关系表结构定义
 * 移动端SQLite版本
 */

import type { UserConversationTable } from '@/types/database';

/**
 * @description: 用户会话关系表创建SQL
 */
export const USER_CONVERSATION_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS user_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    conversation_id TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_muted BOOLEAN DEFAULT FALSE,
    user_read_seq INTEGER DEFAULT 0,
    version INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER,
    UNIQUE(user_id, conversation_id)
  );
`;

/**
 * @description: 用户会话关系表索引SQL
 * 只保留复合索引用于排序查询
 */
export const USER_CONVERSATION_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_user_conversations_pinned ON user_conversations(is_pinned DESC, updated_at DESC);
`;

/**
 * @description: 用户会话关系表字段名常量
 */
export const USER_CONVERSATION_FIELDS = {
  ID: 'id',
  USER_ID: 'user_id',
  CONVERSATION_ID: 'conversation_id',
  IS_HIDDEN: 'is_hidden',
  IS_PINNED: 'is_pinned',
  IS_MUTED: 'is_muted',
  USER_READ_SEQ: 'user_read_seq',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;