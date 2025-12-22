/**
 * @description: 表情表结构定义
 * 移动端SQLite版本
 */

import type { EmojiTable } from '@/types/database';

/**
 * @description: 表情表创建SQL
 */
export const EMOJI_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS emoji (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emoji_id TEXT NOT NULL UNIQUE,
    file_key TEXT NOT NULL,
    title TEXT NOT NULL,
    emoji_info TEXT,
    status INTEGER DEFAULT 1,
    version INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  );
`;

/**
 * @description: 表情表索引SQL
 */
export const EMOJI_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_emoji_emoji_id ON emoji(emoji_id);
  CREATE INDEX IF NOT EXISTS idx_emoji_status ON emoji(status);
`;

/**
 * @description: 表情表字段名常量
 */
export const EMOJI_FIELDS = {
  ID: 'id',
  EMOJI_ID: 'emoji_id',
  FILE_KEY: 'file_key',
  TITLE: 'title',
  EMOJI_INFO: 'emoji_info',
  STATUS: 'status',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;
