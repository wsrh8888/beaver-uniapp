/**
 * @description: 聊天消息表初始化
 */

import { MESSAGE_TABLE_SQL, MESSAGE_INDEX_SQL } from '@/database/tables/chat/message';

/**
 * @description: 初始化消息表
 */
export const initMessagesTable = (db: any) => {
  try {
    db.exec(MESSAGE_TABLE_SQL);
    db.exec(MESSAGE_INDEX_SQL);
    console.log('消息表初始化完成');
  } catch (error) {
    console.error('消息表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 聊天模块消息表初始化数据
 */
export const initChatMessagesData = async () => {
  // 这里可以添加初始化数据的逻辑
  console.log('聊天消息表数据初始化完成');
};