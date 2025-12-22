/**
 * @description: 表情服务
 */

import { EMOJI_FIELDS } from '../../tables/emoji/emoji';
import { EmojiStatus } from '@/types/database';
import type { EmojiTable } from '@/types/database';

/**
 * @description: 获取表情列表
 */
export const getEmojis = (db: any, status?: EmojiStatus): Promise<EmojiTable[]> => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT ${Object.values(EMOJI_FIELDS).join(', ')}
      FROM emoji
    `;
    const params: any[] = [];

    if (status !== undefined) {
      sql += ` WHERE ${EMOJI_FIELDS.STATUS} = ?`;
      params.push(status);
    }

    sql += ` ORDER BY ${EMOJI_FIELDS.CREATED_AT} DESC`;

    db.all(sql, params, (err: any, rows: EmojiTable[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

/**
 * @description: 根据ID获取表情
 */
export const getEmojiById = (db: any, emojiId: string): Promise<EmojiTable | null> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT ${Object.values(EMOJI_FIELDS).join(', ')}
      FROM emoji
      WHERE ${EMOJI_FIELDS.EMOJI_ID} = ?
    `;

    db.get(sql, [emojiId], (err: any, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

/**
 * @description: 添加表情
 */
export const addEmoji = (db: any, emoji: Omit<EmojiTable, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const sql = `
      INSERT INTO emoji (
        ${EMOJI_FIELDS.EMOJI_ID},
        ${EMOJI_FIELDS.FILE_KEY},
        ${EMOJI_FIELDS.TITLE},
        ${EMOJI_FIELDS.EMOJI_INFO},
        ${EMOJI_FIELDS.STATUS},
        ${EMOJI_FIELDS.VERSION},
        ${EMOJI_FIELDS.CREATED_AT},
        ${EMOJI_FIELDS.UPDATED_AT}
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      emoji.emoji_id,
      emoji.file_key,
      emoji.title,
      emoji.emoji_info,
      emoji.status,
      emoji.version,
      now,
      now
    ], function(this: any, err: any) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

/**
 * @description: 更新表情
 */
export const updateEmoji = (db: any, emojiId: string, updates: Partial<Omit<EmojiTable, 'id' | 'created_at'>>): Promise<void> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      resolve();
      return;
    }

    fields.push(`${EMOJI_FIELDS.UPDATED_AT} = ?`);
    values.push(now);

    const sql = `
      UPDATE emoji
      SET ${fields.join(', ')}
      WHERE ${EMOJI_FIELDS.EMOJI_ID} = ?
    `;
    values.push(emojiId);

    db.run(sql, values, function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * @description: 删除表情
 */
export const deleteEmoji = (db: any, emojiId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM emoji WHERE ${EMOJI_FIELDS.EMOJI_ID} = ?`;

    db.run(sql, [emojiId], function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * @description: 批量添加表情
 */
export const batchAddEmojis = (db: any, emojis: Omit<EmojiTable, 'id' | 'created_at' | 'updated_at'>[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      try {
        const stmt = db.prepare(`
          INSERT OR REPLACE INTO emoji (
            ${EMOJI_FIELDS.EMOJI_ID},
            ${EMOJI_FIELDS.FILE_KEY},
            ${EMOJI_FIELDS.TITLE},
            ${EMOJI_FIELDS.EMOJI_INFO},
            ${EMOJI_FIELDS.STATUS},
            ${EMOJI_FIELDS.VERSION},
            ${EMOJI_FIELDS.CREATED_AT},
            ${EMOJI_FIELDS.UPDATED_AT}
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const emoji of emojis) {
          stmt.run([
            emoji.emoji_id,
            emoji.file_key,
            emoji.title,
            emoji.emoji_info,
            emoji.status,
            emoji.version,
            now,
            now
          ]);
        }

        stmt.finalize();
        db.run('COMMIT', (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } catch (error) {
        db.run('ROLLBACK');
        reject(error);
      }
    });
  });
};
