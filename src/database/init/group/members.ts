/**
 * @description: 群成员表数据库初始化
 */

import { GROUP_MEMBERS_TABLE_SQL, GROUP_MEMBERS_INDEX_SQL } from '@/database/tables/group/members';

/**
 * @description: 初始化群成员表
 */
export const initGroupMembersTable = (db: any) => {
  try {
    db.exec(GROUP_MEMBERS_TABLE_SQL);
    db.exec(GROUP_MEMBERS_INDEX_SQL);
    console.log('群成员表初始化完成');
  } catch (error) {
    console.error('群成员表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化群成员数据
 */
export const initGroupMembersData = async (): Promise<void> => {
  try {
    console.log('群成员数据初始化完成');
  } catch (error) {
    console.error('群成员数据初始化失败:', error);
    throw error;
  }
};
