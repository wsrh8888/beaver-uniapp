/**
 * @description: 表情包与表情关联表数据库初始化
 */

import { EMOJI_PACKAGE_EMOJI_TABLE_SQL, EMOJI_PACKAGE_EMOJI_INDEX_SQL } from '@/database/tables/emoji/package_emoji';

/**
 * @description: 初始化表情包与表情关联表
 */
export const initEmojiPackageEmojiTable = (db: any) => {
  try {
    db.exec(EMOJI_PACKAGE_EMOJI_TABLE_SQL);
    db.exec(EMOJI_PACKAGE_EMOJI_INDEX_SQL);
    console.log('表情包与表情关联表初始化完成');
  } catch (error) {
    console.error('表情包与表情关联表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化表情包与表情关联数据
 */
export const initEmojiPackageEmojiData = async (): Promise<void> => {
  try {
    console.log('表情包与表情关联数据初始化完成');
  } catch (error) {
    console.error('表情包与表情关联数据初始化失败:', error);
    throw error;
  }
};
