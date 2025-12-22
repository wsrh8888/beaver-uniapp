/**
 * @description: 群组模块数据库初始化入口
 */

import { initGroupsTable } from './groups';
import { initGroupMembersTable } from './members';
import { initGroupJoinRequestsTable } from './join-requests';
import { initGroupSyncStatusTable } from './sync-status';

/**
 * @description: 初始化群组模块的所有表
 */
export const initGroupTables = (db: any) => {
  try {
    initGroupsTable(db);
    initGroupMembersTable(db);
    initGroupJoinRequestsTable(db);
    initGroupSyncStatusTable(db);
    console.log('群组模块所有表初始化完成');
  } catch (error) {
    console.error('群组模块表初始化失败:', error);
    throw error;
  }
};

