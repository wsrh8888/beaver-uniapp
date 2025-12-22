/**
 * @description: 媒体模块数据库初始化入口
 */

import { initMediaTable } from './media';

/**
 * @description: 初始化媒体模块的所有表
 */
export const initMediaTables = (db: any) => {
  try {
    initMediaTable(db);
    console.log('媒体模块所有表初始化完成');
  } catch (error) {
    console.error('媒体模块表初始化失败:', error);
    throw error;
  }
};

