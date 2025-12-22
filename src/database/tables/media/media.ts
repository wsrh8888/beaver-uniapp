/**
 * @description: 媒体表结构定义
 * 移动端SQLite版本
 */

import type { MediaTable } from '@/types/database';

/**
 * @description: 媒体表创建SQL
 */
export const MEDIA_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_key TEXT NOT NULL UNIQUE,
    path TEXT NOT NULL,
    type TEXT NOT NULL,
    size INTEGER,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    is_deleted INTEGER DEFAULT 0
  );
`;

/**
 * @description: 媒体表索引SQL
 */
export const MEDIA_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_media_file_key ON media(file_key);
  CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
  CREATE INDEX IF NOT EXISTS idx_media_is_deleted ON media(is_deleted);
`;

/**
 * @description: 媒体表字段名常量
 */
export const MEDIA_FIELDS = {
  ID: 'id',
  FILE_KEY: 'file_key',
  PATH: 'path',
  TYPE: 'type',
  SIZE: 'size',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
  IS_DELETED: 'is_deleted',
} as const;

