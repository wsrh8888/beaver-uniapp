/**
 * @description: 数据同步状态模块数据库初始化
 */

import { DATASYNC_TABLE_SQL, DATASYNC_INDEX_SQL } from '@/database/tables/datasync/datasync';

/**
 * @description: 初始化数据同步状态表
 */
export const initDatasyncTable = (db: any) => {
  try {
    db.exec(DATASYNC_TABLE_SQL);
    db.exec(DATASYNC_INDEX_SQL);
    console.log('数据同步状态表初始化完成');
  } catch (error) {
    console.error('数据同步状态表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化数据同步状态数据
 */
export const initDatasyncData = async (): Promise<void> => {
  try {
    // 这里可以初始化一些默认的同步状态数据
    console.log('数据同步状态数据初始化完成');
  } catch (error) {
    console.error('数据同步状态数据初始化失败:', error);
    throw error;
  }
};
