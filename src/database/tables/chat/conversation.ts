/**
 * @description: 会话表结构定义
 * 移动端SQLite版本
 */

import type { ConversationTable } from '@/types/database';

/**
 * @description: 会话表创建SQL
 */
export const CONVERSATION_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT UNIQUE NOT NULL,
    type INTEGER NOT NULL DEFAULT 1,
    max_seq INTEGER DEFAULT 0,
    last_message TEXT,
    version INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
  );
`;


/**
 * @description: 会话表字段名常量
 */
export const CONVERSATION_FIELDS = {
  ID: 'id',
  CONVERSATION_ID: 'conversation_id',
  TYPE: 'type',
  MAX_SEQ: 'max_seq',
  LAST_MESSAGE: 'last_message',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;

/**
 * @description: 会话表索引SQL
 * 只保留最必要的索引，避免过度索引
 */
export const CONVERSATION_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id ON conversations(conversation_id);
`;