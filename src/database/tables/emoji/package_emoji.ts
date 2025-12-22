/**
 * @description: 表情包与表情关联表结构定义
 * 移动端SQLite版本
 */

import type { EmojiPackageEmojiTable } from '@/types/database';

/**
 * @description: 表情包与表情关联表创建SQL
 */
export const EMOJI_PACKAGE_EMOJI_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS emoji_package_emoji (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    relation_id TEXT NOT NULL UNIQUE,
    package_id TEXT NOT NULL,
    emoji_id TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    version INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  );
`;

/**
 * @description: 表情包与表情关联表索引SQL
 */
export const EMOJI_PACKAGE_EMOJI_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_emoji_package_emoji_package_id ON emoji_package_emoji(package_id);
  CREATE INDEX IF NOT EXISTS idx_emoji_package_emoji_emoji_id ON emoji_package_emoji(emoji_id);
  CREATE INDEX IF NOT EXISTS idx_emoji_package_emoji_sort_order ON emoji_package_emoji(sort_order);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_emoji_package_emoji_relation ON emoji_package_emoji(package_id, emoji_id);
`;

/**
 * @description: 表情包与表情关联表字段名常量
 */
export const EMOJI_PACKAGE_EMOJI_FIELDS = {
  ID: 'id',
  RELATION_ID: 'relation_id',
  PACKAGE_ID: 'package_id',
  EMOJI_ID: 'emoji_id',
  SORT_ORDER: 'sort_order',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;
