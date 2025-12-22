/**
 * @description: 用户收藏表情包表数据库初始化
 */

import { EMOJI_PACKAGE_COLLECT_TABLE_SQL, EMOJI_PACKAGE_COLLECT_INDEX_SQL } from '@/database/tables/emoji/package_collect';

/**
 * @description: 初始化用户收藏表情包表
 */
export const initEmojiPackageCollectTable = (db: any) => {
  try {
    db.exec(EMOJI_PACKAGE_COLLECT_TABLE_SQL);
    db.exec(EMOJI_PACKAGE_COLLECT_INDEX_SQL);
    console.log('用户收藏表情包表初始化完成');
  } catch (error) {
    console.error('用户收藏表情包表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化用户收藏表情包数据
 */
export const initEmojiPackageCollectData = async (): Promise<void> => {
  try {
    console.log('用户收藏表情包数据初始化完成');
  } catch (error) {
    console.error('用户收藏表情包数据初始化失败:', error);
    throw error;
  }
};
