/**
 * @description: 用户同步状态表初始化
 */

import { USER_SYNC_STATUS_TABLE_SQL, USER_SYNC_STATUS_INDEX_SQL } from '@/database/tables/user/sync-status';

/**
 * @description: 初始化用户同步状态表
 */
export const initUserSyncStatusTable = (db: any) => {
  try {
    db.exec(USER_SYNC_STATUS_TABLE_SQL);
    db.exec(USER_SYNC_STATUS_INDEX_SQL);
    console.log('用户同步状态表初始化完成');
  } catch (error) {
    console.error('用户同步状态表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 用户模块同步状态表初始化数据
 */
export const initUserSyncStatusData = async () => {
  // 这里可以添加初始化数据的逻辑
  console.log('用户同步状态表数据初始化完成');
};
