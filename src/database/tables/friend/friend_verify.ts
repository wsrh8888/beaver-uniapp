/**
 * @description: 好友验证表结构定义
 * 移动端SQLite版本
 */

import type { FriendVerifyTable } from '@/types/database';

/**
 * @description: 好友验证表创建SQL
 */
export const FRIEND_VERIFY_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS friend_verifies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    verify_id TEXT UNIQUE NOT NULL,
    send_user_id TEXT NOT NULL,
    rev_user_id TEXT NOT NULL,
    send_status INTEGER DEFAULT 0,
    rev_status INTEGER DEFAULT 0,
    message TEXT,
    source TEXT,
    version INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
  );
`;

/**
 * @description: 好友验证表索引SQL
 */
export const FRIEND_VERIFY_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_friend_verifies_send_user ON friend_verifies(send_user_id);
  CREATE INDEX IF NOT EXISTS idx_friend_verifies_rev_user ON friend_verifies(rev_user_id);
  CREATE INDEX IF NOT EXISTS idx_friend_verifies_status ON friend_verifies(send_status, rev_status);
`;

/**
 * @description: 好友验证表字段名常量
 */
export const FRIEND_VERIFY_FIELDS = {
  ID: 'id',
  VERIFY_ID: 'verify_id',
  SEND_USER_ID: 'send_user_id',
  REV_USER_ID: 'rev_user_id',
  SEND_STATUS: 'send_status',
  REV_STATUS: 'rev_status',
  MESSAGE: 'message',
  SOURCE: 'source',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;

