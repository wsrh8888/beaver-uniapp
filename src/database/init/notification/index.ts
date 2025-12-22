/**
 * @description: 通知模块数据库初始化入口
 */

import { initNotificationEventsTable } from './event';
import { initNotificationInboxesTable } from './inbox';
import { initNotificationReadsTable } from './read';

/**
 * @description: 初始化通知模块的所有表
 */
export const initNotificationTables = (db: any) => {
  try {
    initNotificationEventsTable(db);
    initNotificationInboxesTable(db);
    initNotificationReadsTable(db);
    console.log('通知模块所有表初始化完成');
  } catch (error) {
    console.error('通知模块表初始化失败:', error);
    throw error;
  }
};

