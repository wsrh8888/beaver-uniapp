/**
 * @description: 通知收件箱表数据库初始化
 */

import { NOTIFICATION_INBOXES_TABLE_SQL, NOTIFICATION_INBOXES_INDEX_SQL } from '@/database/tables/notification/inbox';

/**
 * @description: 初始化通知收件箱表
 */
export const initNotificationInboxesTable = (db: any) => {
  try {
    db.exec(NOTIFICATION_INBOXES_TABLE_SQL);
    db.exec(NOTIFICATION_INBOXES_INDEX_SQL);
    console.log('通知收件箱表初始化完成');
  } catch (error) {
    console.error('通知收件箱表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化通知收件箱数据
 */
export const initNotificationInboxesData = async (): Promise<void> => {
  try {
    console.log('通知收件箱数据初始化完成');
  } catch (error) {
    console.error('通知收件箱数据初始化失败:', error);
    throw error;
  }
};
