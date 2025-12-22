/**
 * @description: 入群申请表结构定义
 * 移动端SQLite版本
 */

import type { GroupJoinRequestTable } from '@/types/database';

/**
 * @description: 入群申请表创建SQL
 */
export const GROUP_JOIN_REQUESTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS group_join_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id TEXT NOT NULL,
    applicant_user_id TEXT NOT NULL,
    message TEXT,
    status INTEGER DEFAULT 0,
    handled_by TEXT,
    handled_at INTEGER,
    version INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  );
`;

/**
 * @description: 入群申请表索引SQL
 */
export const GROUP_JOIN_REQUESTS_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_group_join_requests_group_id ON group_join_requests(group_id);
  CREATE INDEX IF NOT EXISTS idx_group_join_requests_applicant_user_id ON group_join_requests(applicant_user_id);
  CREATE INDEX IF NOT EXISTS idx_group_join_requests_status ON group_join_requests(status);
`;

/**
 * @description: 入群申请表字段名常量
 */
export const GROUP_JOIN_REQUESTS_FIELDS = {
  ID: 'id',
  GROUP_ID: 'group_id',
  APPLICANT_USER_ID: 'applicant_user_id',
  MESSAGE: 'message',
  STATUS: 'status',
  HANDLED_BY: 'handled_by',
  HANDLED_AT: 'handled_at',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;

