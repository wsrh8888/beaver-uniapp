/**
 * @description: 数据同步状态模块数据库初始化入口
 */

import { initDatasyncTable } from './datasync';

/**
 * @description: 初始化数据同步状态模块的所有表
 */
export const initDatasyncTables = (db: any) => {
  try {
    initDatasyncTable(db);
    console.log('数据同步状态模块所有表初始化完成');
  } catch (error) {
    console.error('数据同步状态模块表初始化失败:', error);
    throw error;
  }
};

