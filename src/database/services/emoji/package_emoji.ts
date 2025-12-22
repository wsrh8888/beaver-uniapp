/**
 * @description: 表情包与表情关联服务
 */

import { EMOJI_PACKAGE_EMOJI_FIELDS } from '../../tables/emoji/package_emoji';
import type { EmojiPackageEmojiTable } from '@/types/database';

/**
 * @description: 获取表情包中的表情列表
 */
export const getEmojisByPackageId = (db: any, packageId: string): Promise<EmojiPackageEmojiTable[]> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT ${Object.values(EMOJI_PACKAGE_EMOJI_FIELDS).join(', ')}
      FROM emoji_package_emoji
      WHERE ${EMOJI_PACKAGE_EMOJI_FIELDS.PACKAGE_ID} = ?
      ORDER BY ${EMOJI_PACKAGE_EMOJI_FIELDS.SORT_ORDER} ASC
    `;

    db.all(sql, [packageId], (err: any, rows: EmojiPackageEmojiTable[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

/**
 * @description: 添加表情到表情包
 */
export const addEmojiToPackage = (db: any, relation: Omit<EmojiPackageEmojiTable, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const sql = `
      INSERT INTO emoji_package_emoji (
        ${EMOJI_PACKAGE_EMOJI_FIELDS.RELATION_ID},
        ${EMOJI_PACKAGE_EMOJI_FIELDS.PACKAGE_ID},
        ${EMOJI_PACKAGE_EMOJI_FIELDS.EMOJI_ID},
        ${EMOJI_PACKAGE_EMOJI_FIELDS.SORT_ORDER},
        ${EMOJI_PACKAGE_EMOJI_FIELDS.VERSION},
        ${EMOJI_PACKAGE_EMOJI_FIELDS.CREATED_AT},
        ${EMOJI_PACKAGE_EMOJI_FIELDS.UPDATED_AT}
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      relation.relation_id,
      relation.package_id,
      relation.emoji_id,
      relation.sort_order,
      relation.version,
      now,
      now
    ], function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

/**
 * @description: 从表情包中移除表情
 */
export const removeEmojiFromPackage = (db: any, packageId: string, emojiId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = `
      DELETE FROM emoji_package_emoji
      WHERE ${EMOJI_PACKAGE_EMOJI_FIELDS.PACKAGE_ID} = ? AND ${EMOJI_PACKAGE_EMOJI_FIELDS.EMOJI_ID} = ?
    `;

    db.run(sql, [packageId, emojiId], function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
