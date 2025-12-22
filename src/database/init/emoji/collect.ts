/**
 * @description: 用户收藏表情表数据库初始化
 */

import { EMOJI_COLLECT_TABLE_SQL, EMOJI_COLLECT_INDEX_SQL } from '@/database/tables/emoji/collect';

/**
 * @description: 初始化用户收藏表情表
 */
export const initEmojiCollectTable = (db: any) => {
  try {
    db.exec(EMOJI_COLLECT_TABLE_SQL);
    db.exec(EMOJI_COLLECT_INDEX_SQL);
    console.log('用户收藏表情表初始化完成');
  } catch (error) {
    console.error('用户收藏表情表初始化失败:', error);
    throw error;
  }
};

/**
 * @description: 初始化用户收藏表情数据
 */
export const initEmojiCollectData = async (): Promise<void> => {
  try {
    console.log('用户收藏表情数据初始化完成');
  } catch (error) {
    console.error('用户收藏表情数据初始化失败:', error);
    throw error;
  }
};
