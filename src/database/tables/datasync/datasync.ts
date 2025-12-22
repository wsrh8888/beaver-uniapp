/**
 * @description: 数据同步状态表结构定义
 * 移动端SQLite版本
 */

import type { DatasyncTable } from '@/types/database';

/**
 * @description: 数据同步状态表创建SQL
 */
export const DATASYNC_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS datasync (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT NOT NULL,
    version INTEGER,
    updated_at INTEGER NOT NULL,
    UNIQUE(module)
  );
`;

/**
 * @description: 数据同步状态表索引SQL
 */
export const DATASYNC_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_datasync_module ON datasync(module);
`;

/**
 * @description: 数据同步状态表字段名常量
 */
export const DATASYNC_FIELDS = {
  ID: 'id',
  MODULE: 'module',
  VERSION: 'version',
  UPDATED_AT: 'updated_at',
} as const;

