/**
 * @description: 表情包表数据库初始化
 */

import { EMOJI_PACKAGE_TABLE_SQL, EMOJI_PACKAGE_INDEX_SQL } from '@/database/tables/emoji/package';

/**
 * @description: 初始化表情包表
 */
export const initEmojiPackageTable = (db: any) => {
  try {
    db.exec(EMOJI_PACKAGE_TABLE_SQL);
    db.exec(EMOJI_PACKAGE_INDEX_SQL);
    console.log('表情包表初始化完成');
  } catch (error) {
    console.error('表情包表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化表情包数据
 */
export const initEmojiPackageData = async (): Promise<void> => {
  try {
    console.log('表情包数据初始化完成');
  } catch (error) {
    console.error('表情包数据初始化失败:', error);
    throw error;
  }
};
