/**
 * @description: 表情模块数据库初始化入口
 */

import { initEmojiTable } from './emoji';
import { initEmojiPackageTable } from './package';
import { initEmojiCollectTable } from './collect';
import { initEmojiPackageEmojiTable } from './package_emoji';
import { initEmojiPackageCollectTable } from './package_collect';

/**
 * @description: 初始化表情模块的所有表
 */
export const initEmojiTables = (db: any) => {
  try {
    initEmojiTable(db);
    initEmojiPackageTable(db);
    initEmojiCollectTable(db);
    initEmojiPackageEmojiTable(db);
    initEmojiPackageCollectTable(db);
    console.log('表情模块所有表初始化完成');
  } catch (error) {
    console.error('表情模块表初始化失败:', error);
    throw error;
  }
};

