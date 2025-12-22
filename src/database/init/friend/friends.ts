/**
 * @description: 好友表初始化
 */

import { FRIEND_TABLE_SQL, FRIEND_INDEX_SQL } from '@/database/tables/friend/friend';

/**
 * @description: 初始化好友表
 */
export const initFriendsTable = (db: any) => {
  try {
    db.exec(FRIEND_TABLE_SQL);
    db.exec(FRIEND_INDEX_SQL);
    console.log('好友表初始化完成');
  } catch (error) {
    console.error('好友表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 好友模块表初始化数据
 */
export const initFriendData = async () => {
  // 这里可以添加初始化数据的逻辑
  console.log('好友表数据初始化完成');
};