/**
 * @description: 通知已读游标表数据库初始化
 */

import { NOTIFICATION_READS_TABLE_SQL, NOTIFICATION_READS_INDEX_SQL } from '@/database/tables/notification/read';

/**
 * @description: 初始化通知已读游标表
 */
export const initNotificationReadsTable = (db: any) => {
  try {
    db.exec(NOTIFICATION_READS_TABLE_SQL);
    db.exec(NOTIFICATION_READS_INDEX_SQL);
    console.log('通知已读游标表初始化完成');
  } catch (error) {
    console.error('通知已读游标表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化通知已读游标数据
 */
export const initNotificationReadsData = async (): Promise<void> => {
  try {
    console.log('通知已读游标数据初始化完成');
  } catch (error) {
    console.error('通知已读游标数据初始化失败:', error);
    throw error;
  }
};
