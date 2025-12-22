/**
 * @description: 聊天会话表初始化
 */

import { CONVERSATION_TABLE_SQL, CONVERSATION_INDEX_SQL } from '@/database/tables/chat/conversation';

/**
 * @description: 初始化会话表
 */
export const initConversationsTable = (db: any) => {
  try {
    db.exec(CONVERSATION_TABLE_SQL);
    db.exec(CONVERSATION_INDEX_SQL);
    console.log('会话表初始化完成');
  } catch (error) {
    console.error('会话表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 聊天模块会话表初始化数据
 */
export const initChatConversationsData = async () => {
  // 这里可以添加初始化数据的逻辑
  console.log('聊天会话表数据初始化完成');
};