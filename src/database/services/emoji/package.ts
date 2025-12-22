/**
 * @description: 表情包服务
 */

import { EMOJI_PACKAGE_FIELDS, EmojiPackageType, EmojiPackageStatus } from '../../tables/emoji/package';
import type { EmojiPackageTable } from '@/types/database';

/**
 * @description: 获取表情包列表
 */
export const getEmojiPackages = (db: any, userId?: string, type?: EmojiPackageType): Promise<EmojiPackageTable[]> => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT ${Object.values(EMOJI_PACKAGE_FIELDS).join(', ')}
      FROM emoji_package
      WHERE ${EMOJI_PACKAGE_FIELDS.STATUS} = ?
    `;
    const params: any[] = [EmojiPackageStatus.NORMAL];

    if (userId) {
      sql += ` AND ${EMOJI_PACKAGE_FIELDS.USER_ID} = ?`;
      params.push(userId);
    }

    if (type) {
      sql += ` AND ${EMOJI_PACKAGE_FIELDS.TYPE} = ?`;
      params.push(type);
    }

    sql += ` ORDER BY ${EMOJI_PACKAGE_FIELDS.CREATED_AT} DESC`;

    db.all(sql, params, (err: any, rows: EmojiPackageTable[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

/**
 * @description: 根据ID获取表情包
 */
export const getEmojiPackageById = (db: any, packageId: string): Promise<EmojiPackageTable | null> => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT ${Object.values(EMOJI_PACKAGE_FIELDS).join(', ')}
      FROM emoji_package
      WHERE ${EMOJI_PACKAGE_FIELDS.PACKAGE_ID} = ?
    `;

    db.get(sql, [packageId], (err: any, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
};

/**
 * @description: 添加表情包
 */
export const addEmojiPackage = (db: any, emojiPackage: Omit<EmojiPackageTable, 'id' | 'created_at' | 'updated_at'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    const sql = `
      INSERT INTO emoji_package (
        ${EMOJI_PACKAGE_FIELDS.PACKAGE_ID},
        ${EMOJI_PACKAGE_FIELDS.TITLE},
        ${EMOJI_PACKAGE_FIELDS.COVER_FILE},
        ${EMOJI_PACKAGE_FIELDS.USER_ID},
        ${EMOJI_PACKAGE_FIELDS.DESCRIPTION},
        ${EMOJI_PACKAGE_FIELDS.TYPE},
        ${EMOJI_PACKAGE_FIELDS.STATUS},
        ${EMOJI_PACKAGE_FIELDS.VERSION},
        ${EMOJI_PACKAGE_FIELDS.CREATED_AT},
        ${EMOJI_PACKAGE_FIELDS.UPDATED_AT}
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
      emojiPackage.package_id,
      emojiPackage.title,
      emojiPackage.cover_file,
      emojiPackage.user_id,
      emojiPackage.description,
      emojiPackage.type,
      emojiPackage.status,
      emojiPackage.version,
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
 * @description: 更新表情包
 */
export const updateEmojiPackage = (db: any, packageId: string, updates: Partial<Omit<EmojiPackageTable, 'id' | 'created_at'>>): Promise<void> => {
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

    fields.push(`${EMOJI_PACKAGE_FIELDS.UPDATED_AT} = ?`);
    values.push(now);

    const sql = `
      UPDATE emoji_package
      SET ${fields.join(', ')}
      WHERE ${EMOJI_PACKAGE_FIELDS.PACKAGE_ID} = ?
    `;
    values.push(packageId);

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
 * @description: 删除表情包
 */
export const deleteEmojiPackage = (db: any, packageId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM emoji_package WHERE ${EMOJI_PACKAGE_FIELDS.PACKAGE_ID} = ?`;

    db.run(sql, [packageId], function(err: any) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};
