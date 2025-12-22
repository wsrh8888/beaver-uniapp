/**
 * @description: 群成员表结构定义
 * 移动端SQLite版本
 */

import type { GroupMemberTable } from '@/types/database';

/**
 * @description: 群成员表创建SQL
 */
export const GROUP_MEMBERS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role INTEGER DEFAULT 3,
    status INTEGER DEFAULT 1,
    join_time INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    version INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    UNIQUE(group_id, user_id)
  );
`;

/**
 * @description: 群成员表索引SQL
 */
export const GROUP_MEMBERS_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
  CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
  CREATE INDEX IF NOT EXISTS idx_group_members_role ON group_members(role);
  CREATE INDEX IF NOT EXISTS idx_group_members_status ON group_members(status);
`;

/**
 * @description: 群成员表字段名常量
 */
export const GROUP_MEMBERS_FIELDS = {
  ID: 'id',
  GROUP_ID: 'group_id',
  USER_ID: 'user_id',
  ROLE: 'role',
  STATUS: 'status',
  JOIN_TIME: 'join_time',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;

