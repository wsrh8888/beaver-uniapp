/**
 * @description: 消息表结构定义
 * 移动端SQLite版本
 */

/**
 * @description: 消息表创建SQL
 */
export const MESSAGE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT UNIQUE NOT NULL,
    conversation_id TEXT NOT NULL,
    conversation_type INTEGER NOT NULL DEFAULT 1,
    seq INTEGER NOT NULL,
    send_user_id TEXT,
    msg_type INTEGER NOT NULL,
    msg_preview TEXT,
    msg TEXT,
    status INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER
  );
`;

/**
 * @description: 消息表字段名常量
 */
export const MESSAGE_FIELDS = {
  ID: 'id',
  MESSAGE_ID: 'message_id',
  CONVERSATION_ID: 'conversation_id',
  CONVERSATION_TYPE: 'conversation_type',
  SEQ: 'seq',
  SEND_USER_ID: 'send_user_id',
  MSG_TYPE: 'msg_type',
  MSG_PREVIEW: 'msg_preview',
  MSG: 'msg',
  STATUS: 'status',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at',
} as const;

/**
 * @description: 消息表索引SQL
 * 只保留最必要的索引：conversation_id 用于查询会话消息
 */
export const MESSAGE_INDEX_SQL = `
  CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
`;

