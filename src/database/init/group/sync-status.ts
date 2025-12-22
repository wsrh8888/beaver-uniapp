/**
 * @description: 群组同步状态表数据库初始化
 */

import { GROUP_SYNC_STATUS_TABLE_SQL, GROUP_SYNC_STATUS_INDEX_SQL } from '@/database/tables/group/sync-status';

/**
 * @description: 初始化群组同步状态表
 */
export const initGroupSyncStatusTable = (db: any) => {
  try {
    db.exec(GROUP_SYNC_STATUS_TABLE_SQL);
    db.exec(GROUP_SYNC_STATUS_INDEX_SQL);
    console.log('群组同步状态表初始化完成');
  } catch (error) {
    console.error('群组同步状态表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化群组同步状态数据
 */
export const initGroupSyncStatusData = async (): Promise<void> => {
  try {
    console.log('群组同步状态数据初始化完成');
  } catch (error) {
    console.error('群组同步状态数据初始化失败:', error);
    throw error;
  }
};
