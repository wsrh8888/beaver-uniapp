/**
 * @description: 用户模块数据库初始化入口
 */

import { initUsersTable } from './user';
import { initUserSyncStatusTable } from './sync-status';

/**
 * @description: 初始化用户模块的所有表
 */
export const initUserTables = (db: any) => {
  try {
    initUsersTable(db);
    initUserSyncStatusTable(db);
    console.log('用户模块所有表初始化完成');
  } catch (error) {
    console.error('用户模块表初始化失败:', error);
    throw error;
  }
};
