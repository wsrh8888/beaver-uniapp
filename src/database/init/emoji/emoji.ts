/**
 * @description: 表情表数据库初始化
 */

import { EMOJI_TABLE_SQL, EMOJI_INDEX_SQL } from '@/database/tables/emoji/emoji';

/**
 * @description: 初始化表情表
 */
export const initEmojiTable = (db: any) => {
  try {
    db.exec(EMOJI_TABLE_SQL);
    db.exec(EMOJI_INDEX_SQL);
    console.log('表情表初始化完成');
  } catch (error) {
    console.error('表情表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化表情数据
 */
export const initEmojiData = async (): Promise<void> => {
  try {
    // 这里可以初始化一些默认的表情数据
    console.log('表情数据初始化完成');
  } catch (error) {
    console.error('表情数据初始化失败:', error);
    throw error;
  }
};
