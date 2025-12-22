/**
 * @description: 用户表初始化
 */

import { USER_TABLE_SQL, USER_INDEX_SQL } from '@/database/tables/user/user';

/**
 * @description: 初始化用户表
 */
export const initUsersTable = (db: any) => {
  try {
    db.exec(USER_TABLE_SQL);
    db.exec(USER_INDEX_SQL);
    console.log('用户表初始化完成');
  } catch (error) {
    console.error('用户表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 用户模块表初始化数据
 */
export const initUserData = async () => {
  // 这里可以添加初始化数据的逻辑
  console.log('用户表数据初始化完成');
};