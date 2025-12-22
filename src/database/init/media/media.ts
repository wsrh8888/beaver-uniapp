/**
 * @description: 媒体表数据库初始化
 */

import { MEDIA_TABLE_SQL, MEDIA_INDEX_SQL } from '@/database/tables/media/media';

/**
 * @description: 初始化媒体表
 */
export const initMediaTable = (db: any) => {
  try {
    db.exec(MEDIA_TABLE_SQL);
    db.exec(MEDIA_INDEX_SQL);
    console.log('媒体表初始化完成');
  } catch (error) {
    console.error('媒体表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化媒体数据
 */
export const initMediaData = async (): Promise<void> => {
  try {
    console.log('媒体数据初始化完成');
  } catch (error) {
    console.error('媒体数据初始化失败:', error);
    throw error;
  }
};
