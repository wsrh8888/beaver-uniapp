/**
 * @description: 用户收藏表情包服务
 */

import { EMOJI_PACKAGE_COLLECT_FIELDS } from '../../tables/emoji/package_collect';
import type { EmojiPackageCollectTable } from '@/types/database';

/**
 * @description: 获取用户收藏的表情包列表
 */
export const getUserEmojiPackageCollects = (db: any, userId: string): Promise<EmojiPackageCollectTable[]> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT ${Object.values(EMOJI_PACKAGE_COLLECT_FIELDS).join(', ')}
      FROM emoji_package_collect
      WHERE ${EMOJI_PACKAGE_COLLECT_FIELDS.USER_ID} = ? AND ${EMOJI_PACKAGE_COLLECT_FIELDS.IS_DELETED} = 0
      ORDER BY ${EMOJI_PACKAGE_COLLECT_FIELDS.CREATED_AT} DESC
    `;

    db.all(sql, [userId], (err: any, rows: EmojiPackageCollectTable[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

/**
 * @description: 检查表情包是否已收藏
 */
export const isEmojiPackageCollected = (db: any, userId: string, packageId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT COUNT(*) as count
      FROM emoji_package_collect
      WHERE ${EMOJI_PACKAGE_COLLECT_FIELDS.USER_ID} = ? AND ${EMOJI_PACKAGE_COLLECT_FIELDS.PACKAGE_ID} = ? AND ${EMOJI_PACKAGE_COLLECT_FIELDS.IS_DELETED} = 0
    `;

    db.get(sql, [userId, packageId], (err: any, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count > 0);
      }
    });
  });
};

/**
 * @description: 收藏表情包
 */
export const collectEmojiPackage = (db: any, collect: Omit<EmojiPackageCollectTable, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const sql = `
      INSERT INTO emoji_package_collect (
        ${EMOJI_PACKAGE_COLLECT_FIELDS.PACKAGE_COLLECT_ID},
        ${EMOJI_PACKAGE_COLLECT_FIELDS.USER_ID},
        ${EMOJI_PACKAGE_COLLECT_FIELDS.PACKAGE_ID},
        ${EMOJI_PACKAGE_COLLECT_FIELDS.IS_DELETED},
        ${EMOJI_PACKAGE_COLLECT_FIELDS.VERSION},
        ${EMOJI_PACKAGE_COLLECT_FIELDS.CREATED_AT},
        ${EMOJI_PACKAGE_COLLECT_FIELDS.UPDATED_AT}
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      collect.package_collect_id,
      collect.user_id,
      collect.package_id,
      collect.is_deleted,
      collect.version,
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
 * @description: 取消收藏表情包
 */
export const uncollectEmojiPackage = (db: any, userId: string, packageId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const sql = `
      UPDATE emoji_package_collect
      SET ${EMOJI_PACKAGE_COLLECT_FIELDS.IS_DELETED} = 1, ${EMOJI_PACKAGE_COLLECT_FIELDS.UPDATED_AT} = ?
      WHERE ${EMOJI_PACKAGE_COLLECT_FIELDS.USER_ID} = ? AND ${EMOJI_PACKAGE_COLLECT_FIELDS.PACKAGE_ID} = ?
    `;

    db.run(sql, [now, userId, packageId], function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
