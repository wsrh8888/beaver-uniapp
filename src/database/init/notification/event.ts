/**
 * @description: 通知事件主表数据库初始化
 */

import { NOTIFICATION_EVENTS_TABLE_SQL, NOTIFICATION_EVENTS_INDEX_SQL } from '@/database/tables/notification/event';

/**
 * @description: 初始化通知事件主表
 */
export const initNotificationEventsTable = (db: any) => {
  try {
    db.exec(NOTIFICATION_EVENTS_TABLE_SQL);
    db.exec(NOTIFICATION_EVENTS_INDEX_SQL);
    console.log('通知事件主表初始化完成');
  } catch (error) {
    console.error('通知事件主表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化通知事件数据
 */
export const initNotificationEventsData = async (): Promise<void> => {
  try {
    console.log('通知事件数据初始化完成');
  } catch (error) {
    console.error('通知事件数据初始化失败:', error);
    throw error;
  }
};
