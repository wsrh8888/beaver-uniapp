/**
 * @description: 用户收藏表情包表结构定义
 * 移动端SQLite版本
 */

import type { EmojiPackageCollectTable } from '@/types/database';

/**
 * @description: 用户收藏表情包表创建SQL
 */
export const EMOJI_PACKAGE_COLLECT_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS emoji_package_collect (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_collect_id TEXT NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    is_deleted INTEGER DEFAULT 0,
    version INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  );
`;

/**
 * @description: 用户收藏表情包表索引SQL
 */
export const EMOJI_PACKAGE_COLLECT_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_emoji_package_collect_user_id ON emoji_package_collect(user_id);
  CREATE INDEX IF NOT EXISTS idx_emoji_package_collect_package_id ON emoji_package_collect(package_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_emoji_package_collect_user_package ON emoji_package_collect(user_id, package_id);
`;

/**
 * @description: 用户收藏表情包表字段名常量
 */
export const EMOJI_PACKAGE_COLLECT_FIELDS = {
  ID: 'id',
  PACKAGE_COLLECT_ID: 'package_collect_id',
  USER_ID: 'user_id',
  PACKAGE_ID: 'package_id',
  IS_DELETED: 'is_deleted',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;
