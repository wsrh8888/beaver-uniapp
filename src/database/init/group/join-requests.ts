/**
 * @description: 入群申请表数据库初始化
 */

import { GROUP_JOIN_REQUESTS_TABLE_SQL, GROUP_JOIN_REQUESTS_INDEX_SQL } from '@/database/tables/group/join-requests';

/**
 * @description: 初始化入群申请表
 */
export const initGroupJoinRequestsTable = (db: any) => {
  try {
    db.exec(GROUP_JOIN_REQUESTS_TABLE_SQL);
    db.exec(GROUP_JOIN_REQUESTS_INDEX_SQL);
    console.log('入群申请表初始化完成');
  } catch (error) {
    console.error('入群申请表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化入群申请数据
 */
export const initGroupJoinRequestsData = async (): Promise<void> => {
  try {
    console.log('入群申请数据初始化完成');
  } catch (error) {
    console.error('入群申请数据初始化失败:', error);
    throw error;
  }
};
