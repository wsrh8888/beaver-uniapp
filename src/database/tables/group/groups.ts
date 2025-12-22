/**
 * @description: 群组表结构定义
 * 移动端SQLite版本
 */

import type { GroupTable } from '@/types/database';

/**
 * @description: 群组表创建SQL
 */
export const GROUPS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id TEXT NOT NULL UNIQUE,
    type INTEGER DEFAULT 1,
    title TEXT NOT NULL,
    avatar TEXT DEFAULT 'a9de5548bef8c10b92428fff61275c72.png',
    creator_id TEXT NOT NULL,
    notice TEXT,
    join_type INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    version INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  );
`;

/**
 * @description: 群组表索引SQL
 */
export const GROUPS_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_groups_group_id ON groups(group_id);
  CREATE INDEX IF NOT EXISTS idx_groups_creator_id ON groups(creator_id);
  CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);
`;

/**
 * @description: 群组表字段名常量
 */
export const GROUPS_FIELDS = {
  ID: 'id',
  GROUP_ID: 'group_id',
  TYPE: 'type',
  TITLE: 'title',
  AVATAR: 'avatar',
  CREATOR_ID: 'creator_id',
  NOTICE: 'notice',
  JOIN_TYPE: 'join_type',
  STATUS: 'status',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;

