/**
 * @description: 用户表结构定义
 * 移动端SQLite版本
 */

import type { UserTable } from '@/types/database';

/**
 * @description: 用户表创建SQL
 */
export const USER_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT UNIQUE NOT NULL,
    nick_name TEXT,
    avatar TEXT,
    abstract TEXT,
    email TEXT,
    gender INTEGER DEFAULT 0,
    phone TEXT,
    version INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
  );
`;

/**
 * @description: 用户表索引SQL
 * 移动端用户表通常只有一条记录，无需索引
 */
export const USER_INDEX_SQL = `
  -- 用户表数据量极小，无需索引
`;

/**
 * @description: 用户表字段名常量
 */
export const USER_FIELDS = {
  ID: 'id',
  USER_ID: 'user_id',
  NICK_NAME: 'nick_name',
  AVATAR: 'avatar',
  ABSTRACT: 'abstract',
  EMAIL: 'email',
  GENDER: 'gender',
  PHONE: 'phone',
  VERSION: 'version',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;
