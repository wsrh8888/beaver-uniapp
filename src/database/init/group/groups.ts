/**
 * @description: 群组表数据库初始化
 */

import { GROUPS_TABLE_SQL, GROUPS_INDEX_SQL } from '@/database/tables/group/groups';

/**
 * @description: 初始化群组表
 */
export const initGroupsTable = (db: any) => {
  try {
    db.exec(GROUPS_TABLE_SQL);
    db.exec(GROUPS_INDEX_SQL);
    console.log('群组表初始化完成');
  } catch (error) {
    console.error('群组表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化群组数据
 */
export const initGroupsData = async (): Promise<void> => {
  try {
    console.log('群组数据初始化完成');
  } catch (error) {
    console.error('群组数据初始化失败:', error);
    throw error;
  }
};
