/**
 * @description: 用户会话关系表初始化
 */

import { USER_CONVERSATION_TABLE_SQL, USER_CONVERSATION_INDEX_SQL } from '@/database/tables/chat/user-conversation';

/**
 * @description: 初始化用户会话关系表
 */
export const initUserConversationsTable = (db: any) => {
  try {
    db.exec(USER_CONVERSATION_TABLE_SQL);
    db.exec(USER_CONVERSATION_INDEX_SQL);
    console.log('用户会话关系表初始化完成');
  } catch (error) {
    console.error('用户会话关系表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 聊天模块用户会话关系表初始化数据
 */
export const initChatUserConversationsData = async () => {
  // 这里可以添加初始化数据的逻辑
  console.log('用户会话关系表数据初始化完成');
};