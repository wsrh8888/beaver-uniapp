/**
 * @description: 好友表结构定义
 * 移动端SQLite版本
 */

import type { FriendTable } from '@/types/database';

/**
 * @description: 好友表创建SQL
 */
export const FRIEND_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS friends (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    friend_user_id TEXT NOT NULL,
    nick_name TEXT,
    avatar TEXT,
    abstract TEXT,
    notice TEXT,
    source TEXT,
    status INTEGER DEFAULT 1,
    version INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER,
    UNIQUE(user_id, friend_user_id)
  );
`;

/**
 * @description: 好友表索引SQL
 */
export const FRIEND_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id);
  CREATE INDEX IF NOT EXISTS idx_friends_friend ON friends(friend_user_id);
  CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);
`;

/**
 * @description: 好友表字段名常量
 */
export const FRIEND_FIELDS = {
  ID: 'id',
  USER_ID: 'user_id',
  FRIEND_USER_ID: 'friend_user_id',
  NICK_NAME: 'nick_name',
  AVATAR: 'avatar',
  ABSTRACT: 'abstract',
  NOTICE: 'notice',
  SOURCE: 'source',
  STATUS: 'status',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;
