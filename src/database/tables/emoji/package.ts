/**
 * @description: 表情包表结构定义
 * 移动端SQLite版本
 */

import type { EmojiPackageTable } from '@/types/database';

/**
 * @description: 表情包表创建SQL
 */
export const EMOJI_PACKAGE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS emoji_package (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    cover_file TEXT,
    user_id TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,
    status INTEGER DEFAULT 1,
    version INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  );
`;

/**
 * @description: 表情包表索引SQL
 */
export const EMOJI_PACKAGE_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_emoji_package_package_id ON emoji_package(package_id);
  CREATE INDEX IF NOT EXISTS idx_emoji_package_user_id ON emoji_package(user_id);
  CREATE INDEX IF NOT EXISTS idx_emoji_package_type ON emoji_package(type);
`;

/**
 * @description: 表情包表字段名常量
 */
export const EMOJI_PACKAGE_FIELDS = {
  ID: 'id',
  PACKAGE_ID: 'package_id',
  TITLE: 'title',
  COVER_FILE: 'cover_file',
  USER_ID: 'user_id',
  DESCRIPTION: 'description',
  TYPE: 'type',
  STATUS: 'status',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;
