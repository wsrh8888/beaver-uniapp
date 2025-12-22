/**
 * @description: 聊天同步状态表初始化
 */

import { CHAT_SYNC_STATUS_TABLE_SQL, CHAT_SYNC_STATUS_INDEX_SQL } from '@/database/tables/chat/sync-status';

/**
 * @description: 初始化聊天同步状态表
 */
export const initChatSyncStatusTable = (db: any) => {
  try {
    db.exec(CHAT_SYNC_STATUS_TABLE_SQL);
    db.exec(CHAT_SYNC_STATUS_INDEX_SQL);
    console.log('聊天同步状态表初始化完成');
  } catch (error) {
    console.error('聊天同步状态表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 聊天模块同步状态表初始化数据
 */
export const initChatSyncStatusData = async () => {
  // 这里可以添加初始化数据的逻辑
  console.log('聊天同步状态表数据初始化完成');
};
