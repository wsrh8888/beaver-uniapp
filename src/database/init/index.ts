/**
 * @description: 数据库初始化入口文件
 */

import { initChatTables } from './chat';
import { initFriendTables } from './friend';
import { initUserTables } from './user';
import { initDatasyncTables } from './datasync';
import { initEmojiTables } from './emoji';
import { initGroupTables } from './group';
import { initMediaTables } from './media';
import { initNotificationTables } from './notification';

/**
 * @description: 初始化所有数据库表
 */
export const initAllTables = (db: any) => {
  try {
    // 初始化原有模块
    initChatTables(db);
    initFriendTables(db);
    initUserTables(db);

    // 初始化新增模块
    initDatasyncTables(db);
    initEmojiTables(db);
    initGroupTables(db);
    initMediaTables(db);
    initNotificationTables(db);

    console.log('所有数据库表初始化完成');
  } catch (error) {
    console.error('数据库表初始化失败:', error);
    throw error;
  }
};
