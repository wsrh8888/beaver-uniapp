/**
 * @description: 用户收藏表情服务
 */

import { EMOJI_COLLECT_FIELDS } from '../../tables/emoji/collect';
import type { EmojiCollectTable } from '@/types/database';

/**
 * @description: 获取用户收藏的表情列表
 */
export const getUserEmojiCollects = (db: any, userId: string): Promise<EmojiCollectTable[]> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT ${Object.values(EMOJI_COLLECT_FIELDS).join(', ')}
      FROM emoji_collect
      WHERE ${EMOJI_COLLECT_FIELDS.USER_ID} = ? AND ${EMOJI_COLLECT_FIELDS.IS_DELETED} = 0
      ORDER BY ${EMOJI_COLLECT_FIELDS.CREATED_AT} DESC
    `;

    db.all(sql, [userId], (err: any, rows: EmojiCollectTable[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

/**
 * @description: 检查表情是否已收藏
 */
export const isEmojiCollected = (db: any, userId: string, emojiId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT COUNT(*) as count
      FROM emoji_collect
      WHERE ${EMOJI_COLLECT_FIELDS.USER_ID} = ? AND ${EMOJI_COLLECT_FIELDS.EMOJI_ID} = ? AND ${EMOJI_COLLECT_FIELDS.IS_DELETED} = 0
    `;

    db.get(sql, [userId, emojiId], (err: any, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row.count > 0);
      }
    });
  });
};

/**
 * @description: 收藏表情
 */
export const collectEmoji = (db: any, collect: Omit<EmojiCollectTable, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const sql = `
      INSERT INTO emoji_collect (
        ${EMOJI_COLLECT_FIELDS.EMOJI_COLLECT_ID},
        ${EMOJI_COLLECT_FIELDS.USER_ID},
        ${EMOJI_COLLECT_FIELDS.EMOJI_ID},
        ${EMOJI_COLLECT_FIELDS.PACKAGE_ID},
        ${EMOJI_COLLECT_FIELDS.IS_DELETED},
        ${EMOJI_COLLECT_FIELDS.VERSION},
        ${EMOJI_COLLECT_FIELDS.CREATED_AT},
        ${EMOJI_COLLECT_FIELDS.UPDATED_AT}
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      collect.emoji_collect_id,
      collect.user_id,
      collect.emoji_id,
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
 * @description: 取消收藏表情
 */
export const uncollectEmoji = (db: any, userId: string, emojiId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const sql = `
      UPDATE emoji_collect
      SET ${EMOJI_COLLECT_FIELDS.IS_DELETED} = 1, ${EMOJI_COLLECT_FIELDS.UPDATED_AT} = ?
      WHERE ${EMOJI_COLLECT_FIELDS.USER_ID} = ? AND ${EMOJI_COLLECT_FIELDS.EMOJI_ID} = ?
    `;

    db.run(sql, [now, userId, emojiId], function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
