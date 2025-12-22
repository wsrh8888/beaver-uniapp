/**
 * @description: 用户收藏表情表结构定义
 * 移动端SQLite版本
 */

import type { EmojiCollectTable } from '@/types/database';

/**
 * @description: 用户收藏表情表创建SQL
 */
export const EMOJI_COLLECT_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS emoji_collect (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emoji_collect_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    emoji_id TEXT NOT NULL,
    package_id TEXT,
    is_deleted INTEGER DEFAULT 0,
    version INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  );
`;

/**
 * @description: 用户收藏表情表索引SQL
 */
export const EMOJI_COLLECT_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_emoji_collect_user_id ON emoji_collect(user_id);
  CREATE INDEX IF NOT EXISTS idx_emoji_collect_emoji_id ON emoji_collect(emoji_id);
  CREATE INDEX IF NOT EXISTS idx_emoji_collect_package_id ON emoji_collect(package_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_emoji_collect_user_emoji ON emoji_collect(user_id, emoji_id);
`;

/**
 * @description: 用户收藏表情表字段名常量
 */
export const EMOJI_COLLECT_FIELDS = {
  ID: 'id',
  EMOJI_COLLECT_ID: 'emoji_collect_id',
  USER_ID: 'user_id',
  EMOJI_ID: 'emoji_id',
  PACKAGE_ID: 'package_id',
  IS_DELETED: 'is_deleted',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;
