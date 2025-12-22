/**
 * @description: 聊天模块数据库初始化入口
 */

import { initConversationsTable } from './conversations';
import { initMessagesTable } from './messages';
import { initUserConversationsTable } from './user-conversations';
import { initChatSyncStatusTable } from './sync-status';

/**
 * @description: 初始化聊天模块的所有表
 */
export const initChatTables = (db: any) => {
  try {
    initConversationsTable(db);
    initMessagesTable(db);
    initUserConversationsTable(db);
    initChatSyncStatusTable(db);
    console.log('聊天模块所有表初始化完成');
  } catch (error) {
    console.error('聊天模块表初始化失败:', error);
    throw error;
  }
};