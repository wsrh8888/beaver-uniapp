/**
 * @description: 好友验证表初始化
 */

import { FRIEND_VERIFY_TABLE_SQL, FRIEND_VERIFY_INDEX_SQL } from '@/database/tables/friend/friend_verify';

/**
 * @description: 初始化好友验证表
 */
export const initFriendVerifiesTable = (db: any) => {
  try {
    db.exec(FRIEND_VERIFY_TABLE_SQL);
    db.exec(FRIEND_VERIFY_INDEX_SQL);
    console.log('好友验证表初始化完成');
  } catch (error) {
    console.error('好友验证表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 好友模块验证表初始化数据
 */
export const initFriendVerifiesData = async () => {
  // 这里可以添加初始化数据的逻辑
  console.log('好友验证表数据初始化完成');
};
