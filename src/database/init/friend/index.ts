/**
 * @description: 好友模块数据库初始化入口
 */

import { initFriendsTable } from './friends';
import { initFriendVerifiesTable } from './verifies';

/**
 * @description: 初始化好友模块的所有表
 */
export const initFriendTables = (db: any) => {
  try {
    initFriendsTable(db);
    initFriendVerifiesTable(db);
    console.log('好友模块所有表初始化完成');
  } catch (error) {
    console.error('好友模块表初始化失败:', error);
    throw error;
  }
};
